'use server'

import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin'
import { Timestamp } from 'firebase-admin/firestore'
import { getErrorMessage, timestampToISOString } from '@/utils/helpers'
import { RoleRequestAcceptedEmail, RoleRequestRejectedEmail } from '@/utils/MailTemplates'
import { sendEmail } from '@/utils/mail'

type RequestRoleUpgradeInput = {
  requestedRole: 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE'
  message: string
}

export async function requestRoleUpgrade({ requestedRole, message }: RequestRoleUpgradeInput) {
  try {
    const cookiesStore = await cookies()

    const accessToken = cookiesStore.get('accessToken')?.value;

    if (!accessToken) {
      return {
        success: false,
        status: 404,
        message: "access token not exist",
      };
    }

    // Verify Firebase session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(accessToken, true)
    const userId = decodedClaims.uid

    // Get user doc from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userDoc.exists || !userData) {
      return {
        success: false,
        status: 404,
        message: "User not exist",
      };
    }

    const currentRole = userData.user_type || 'REGULAR'
    const name = userData.name

    // Optional: prevent duplicate pending requests
    const existing = await adminDb
      .collection('role_requests')
      .where('userId', '==', userId)
      .where('requestedRole', '==', requestedRole)
      .where('status', '==', 'pending')
      .get()

    if (!existing.empty) {
      return {
        success: false,
        status: 400,
        message: "You already have a pending request",
      };
    }

    // Store request
    const req = await adminDb.collection('role_requests').add({
      userId,
      name,
      currentRole,
      requestedRole,
      message,
      status: 'pending',
      createdAt: Timestamp.now(),
    })

    return {
      success: true,
      status: 200,
      message: "request sent successfully",
    };
  } catch (err: unknown) {
    return {
      success: false,
      status: 500,
      message: getErrorMessage(err),
    };
  }
}

export type RoleRequest = {
  id: string;
  userId: string;
  name: string;
  status: string;
  message: string;
  requestedRole: string;
  currentRole: string;
  createdAt: Timestamp;
};

export async function getAllRoleRequests({
  pageSize = 10,
  cursor = null,
}: {
  pageSize?: number;
  cursor?: string | null;
}): Promise<{
  success: boolean;
  status: number;
  message: string;
  data: { data: RoleRequest[]; nextCursor: string | null } | null;
}> {
  try {
    let q = adminDb
      .collection("role_requests")
      .orderBy("createdAt", "asc")
      .limit(pageSize);

    if (cursor) {
      const cursorDate = new Date(cursor);
      q = q.startAfter(cursorDate);
    }

    const snapshot = await q.get();

    const roleRequests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null, // <-- serialize Timestamp
      } as RoleRequest;
    });


    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc?.get("createdAt")?.toDate().toISOString() ?? null;

    return {
      success: true,
      status: 200,
      message: "Fetched role requests successfully",
      data: { data: roleRequests, nextCursor },
    };
  } catch (error: unknown) {
    console.error("Error fetching role requests:", error);
    return {
      success: false,
      status: 400,
      message: getErrorMessage(error),
      data: null,
    };
  }
}

export async function acceptRoleRequest({
  targetUserId,
  requestedRole,
  currentRole,
}: {
  targetUserId: string;
  requestedRole: string;
  currentRole: string;
}): Promise<{
  success: boolean;
  status: number;
  message: string;
  data: null;
}> {
  try {
    const cookiesStore = await cookies();
    const actionPerformerId = cookiesStore.get('userId')?.value;

    if (!actionPerformerId) {
      return {
        success: false,
        status: 404,
        message: "Action performer id is missing",
        data: null,
      };
    }

    // Verify performer is UpperTrustie
    const performerSnap = await adminDb.collection("users").doc(actionPerformerId).get();
    if (!performerSnap.exists || performerSnap.data()?.user_type !== "UPPER_TRUSTIE") {
      return {
        success: false,
        status: 403,
        message: "Only UpperTrustie can approve role upgrades.",
        data: null,
      };
    }

    // Get and validate target user
    const targetRef = adminDb.collection("users").doc(targetUserId);
    const targetSnap = await targetRef.get();
    const target = targetSnap.data();

    if (!targetSnap.exists || target?.user_type !== currentRole) {
      return {
        success: false,
        status: 400,
        message: `User role mismatch. Expected '${currentRole}', found '${target?.user_type}'`,
        data: null,
      };
    }

    // Update user's role
    await targetRef.update({ user_type: requestedRole });

    // Query and move the request to history
    const reqSnap = await adminDb.collection("role_requests")
      .where("userId", "==", targetUserId)
      .where("requestedRole", "==", requestedRole)
      .where("status", "==", "pending")
      .get();

    const reviewedAt = new Date().toISOString();

    const moveToHistory = reqSnap.docs.map((doc) => {
      const data = doc.data();
      return Promise.all([
        adminDb.collection("role_requests_history").add({
          ...data,
          status: "accepted",
          reviewedAt,
          reviewedBy: actionPerformerId,
        }),
        doc.ref.delete(),
      ]);
    });

    await Promise.all(moveToHistory);

    const performer = performerSnap.data();
    const performerName = performer?.name || 'Admin';
    const performerEmail = performer?.email || 'not found';

    const html = RoleRequestAcceptedEmail(
      target?.name,
      requestedRole,
      'Your contributions have been appreciated. Welcome aboard!',
      performerName,
      performerEmail
    );

    if (target?.email) {
      await sendEmail(
        target.email,
        'Role Request Approved – Hussaini Welfare Association',
        html
      );
    }

    return {
      success: true,
      status: 200,
      message: "Role upgrade successful.",
      data: null,
    };
  } catch (error: unknown) {
    console.error("acceptRoleRequest error:", error);
    return {
      success: false,
      status: 500,
      message: getErrorMessage(error),
      data: null,
    };
  }
}


export async function rejectRoleRequest({
  targetUserId,
  requestedRole,
  currentRole,
  rejectReason,
}: {
  targetUserId: string;
  requestedRole: string;
  currentRole: string;
  rejectReason?: string;
}): Promise<{
  success: boolean;
  status: number;
  message: string;
  data: null;
}> {
  try {
    const cookiesStore = await cookies();
    const actionPerformerId = cookiesStore.get('userId')?.value;

    if (!actionPerformerId) {
      return {
        success: false,
        status: 404,
        message: "Action performer id is missing",
        data: null,
      };
    }

    // Verify performer
    const performerSnap = await adminDb.collection("users").doc(actionPerformerId).get();
    if (!performerSnap.exists || performerSnap.data()?.user_type !== "UPPER_TRUSTIE") {
      return {
        success: false,
        status: 403,
        message: "Only UpperTrustie can reject role upgrades.",
        data: null,
      };
    }

    // Validate user
    const targetRef = adminDb.collection("users").doc(targetUserId);
    const targetSnap = await targetRef.get();
    const target = targetSnap.data();

    if (!targetSnap.exists || target?.user_type !== currentRole) {
      return {
        success: false,
        status: 400,
        message: `User role mismatch. Expected '${currentRole}', found '${target?.user_type}'`,
        data: null,
      };
    }

    // Move request to history
    const reqSnap = await adminDb.collection("role_requests")
      .where("userId", "==", targetUserId)
      .where("requestedRole", "==", requestedRole)
      .where("status", "==", "pending")
      .get();

    const reviewedAt = new Date().toISOString();

    const promises = reqSnap.docs.map((doc) => {
      const data = doc.data();
      return Promise.all([
        adminDb.collection("role_requests_history").add({
          ...data,
          status: "rejected",
          rejectionReason: rejectReason || "No reason provided",
          reviewedAt,
          reviewedBy: actionPerformerId,
        }),
        doc.ref.delete(),
      ]);
    });
    await Promise.all(promises);

    const performer = performerSnap.data();
    const performerName = performer?.name || 'Admin'
    const performerEmail = performer?.email || 'not found'

    const reason = rejectReason || 'Reason not Provided';

    const html = RoleRequestRejectedEmail(target?.name, requestedRole, reason, performerName, performerEmail)

    if (target?.email) {
      await sendEmail(target?.email, 'Your Role Request has been Rejected Hussaini Welfare association', html);
    }

    return {
      success: true,
      status: 200,
      message: "Role request rejected successfully.",
      data: null,
    };
  } catch (error: unknown) {
    console.error("rejectRoleRequest error:", error);
    return {
      success: false,
      status: 500,
      message: getErrorMessage(error),
      data: null,
    };
  }
}

export async function getRoleRequestHistory(userId: string) {
  if (!userId) {
    return { success: false, status: 400, message: 'User ID is required' };
  }

  try {
    const snapshot = await adminDb
      .collection('role_requests_history')
      .where('userId', '==', userId)
      .orderBy('reviewedAt', 'desc')
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        status: 200,
        message: 'No role request history found',
        data: [],
      };
    }

    const historyData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: userId, // Assuming `id` is the parameter passed to `getRoleRequestHistory(id)`
        name: data?.name || "", // Provide a fallback if `name` is missing
        message: data?.message || "", // Provide a fallback if `message` is missing
        currentRole: data?.currentRole || "", // Provide a fallback if `currentRole` is missing
        requestedRole: data?.requestedRole || "", // Add the missing `requestedRole`
        status: data?.status || "rejected", // Fallback to a valid status
        reviewedBy: data?.reviewedBy,
        rejectionReason: data?.rejectionReason || "",
        createdAt: timestampToISOString(data.createdAt) || undefined,
        reviewedAt: timestampToISOString(data.reviewedAt) || undefined,
      };
    });

    return {
      success: true,
      status: 200,
      message: 'Role request history fetched successfully',
      data: historyData,
    };
  } catch (error: unknown) {
    return {
      success: false,
      status: 500,
      message: getErrorMessage(error),
    };
  }
}

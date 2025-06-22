'use server'

import { adminAuth, adminDb } from '@/firebase/firebaseAdmin'
import { Timestamp } from 'firebase-admin/firestore'
import { getErrorMessage, timestampToISOString } from '@/utils/helpers'
import { RoleRequestAcceptedEmail, RoleRequestRejectedEmail } from '@/utils/MailTemplates'
import { sendEmail } from '@/utils/mail'
import { RequestRoleUpgradeInput, RoleRequest } from '@/types'
import { getCookiesFromServer } from '@/lib/serverUtils'

/**
 * Handles a user's request to upgrade their role within the system.
 *
 * - Verifies the Firebase session cookie to authenticate the user.
 * - Checks if the user exists in the Firestore `users` collection.
 * - Prevents duplicate pending requests for the same role.
 * - Stores the request in the `role_requests` collection with a `pending` status.
 *
 * @param requestedRole - The role the user is requesting.
 * @param message - Optional message or justification for the role upgrade.
 * @returns A response object indicating the success/failure of the operation.
 */
export async function requestRoleUpgrade({ requestedRole, message }: RequestRoleUpgradeInput) {
  try {
    // Get access token from server cookies
    const { accessToken } = await getCookiesFromServer();

    if (!accessToken) {
      return {
        success: false,
        status: 404,
        message: "Access token not found.",
      };
    }

    // Decode and verify Firebase session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(accessToken, true);
    const userId = decodedClaims.uid;

    // Fetch the user document from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userDoc.exists || !userData) {
      return {
        success: false,
        status: 404,
        message: "User not found.",
      };
    }

    const currentRole = userData.user_type || 'REGULAR';
    const name = userData.name;

    // Check for existing pending request with the same target role
    const existing = await adminDb
      .collection('role_requests')
      .where('userId', '==', userId)
      .where('requestedRole', '==', requestedRole)
      .where('status', '==', 'pending')
      .get();

    if (!existing.empty) {
      return {
        success: false,
        status: 400,
        message: "You already have a pending request.",
      };
    }

    // Save the new role request to Firestore
    await adminDb.collection('role_requests').add({
      userId,
      name,
      currentRole,
      requestedRole,
      message,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      status: 200,
      message: "Request sent successfully.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      status: 500,
      message: getErrorMessage(err),
    };
  }
}

/**
 * Fetches a paginated list of role upgrade requests from Firestore.
 *
 * - Supports cursor-based pagination using `createdAt` field.
 * - Returns a `nextCursor` for fetching the next page.
 *
 * @param pageSize - Number of items to fetch per page (default is 10).
 * @param cursor - ISO timestamp string used to paginate from last item.
 * @returns A response object with success status, message, and role requests data.
 */
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
    // Build the Firestore query
    let query = adminDb
      .collection("role_requests")
      .orderBy("createdAt", "asc")
      .limit(pageSize);

    // If cursor exists, start after it for pagination
    if (cursor) {
      const cursorDate = new Date(cursor);
      query = query.startAfter(cursorDate);
    }

    // Execute the query
    const snapshot = await query.get();

    // Map the results to RoleRequest[] format
    const roleRequests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null, // Convert Firestore Timestamp to ISO string
      } as RoleRequest;
    });

    // Determine the nextCursor from the last document
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc?.get("createdAt")?.toDate().toISOString() ?? null;

    return {
      success: true,
      status: 200,
      message: "Fetched role requests successfully",
      data: {
        data: roleRequests,
        nextCursor,
      },
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

/**
 * Accepts a role upgrade request for a user.
 * Only allowed by a user with 'UPPER_TRUSTIE' role.
 *
 * @param targetUserId - ID of the user requesting the role upgrade
 * @param requestedRole - The role user wants to upgrade to
 * @param currentRole - User's current role to validate before upgrade
 * @returns success/failure response with status and message
 */
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
    // 1. Verify performer identity
    const { userId: actionPerformerId } = await getCookiesFromServer();

    if (!actionPerformerId) {
      return {
        success: false,
        status: 404,
        message: "Action performer ID is missing.",
        data: null,
      };
    }

    // 2. Check if performer has privileges (must be UPPER_TRUSTIE)
    const performerSnap = await adminDb.collection("users").doc(actionPerformerId).get();
    const performer = performerSnap.data();

    if (!performerSnap.exists || performer?.user_type !== "UPPER_TRUSTIE") {
      return {
        success: false,
        status: 403,
        message: "Only UPPER_TRUSTIE can approve role upgrades.",
        data: null,
      };
    }

    // 3. Validate target user
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

    // 4. Update user's role
    await targetRef.update({ user_type: requestedRole });

    // 5. Find matching pending role request
    const reqSnap = await adminDb.collection("role_requests")
      .where("userId", "==", targetUserId)
      .where("requestedRole", "==", requestedRole)
      .where("status", "==", "pending")
      .get();

    const reviewedAt = new Date().toISOString();

    // 6. Move request(s) to history and delete originals
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

    // 7. Send email to user if email is available
    if (target?.email) {
      const html = RoleRequestAcceptedEmail(
        target.name || "User",
        requestedRole,
        "Your contributions have been appreciated. Welcome aboard!",
        performer?.name || "Admin",
        performer?.email || "admin@example.com"
      );

      await sendEmail(
        target.email,
        "Role Request Approved – Hussaini Welfare Association",
        html
      );
    }

    // 8. Respond
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


/**
 * rejectRoleRequest
 * ------------------
 * Rejects a user's role upgrade request in the system.
 * 
 * Steps performed:
 * 1. Authenticate and authorize the action performer (must be UPPER_TRUSTIE).
 * 2. Validate the target user's current role.
 * 3. Find and reject the corresponding pending role request.
 * 4. Move the request to the `role_requests_history` collection with rejection metadata.
 * 5. Notify the target user via email with the rejection reason.
 * 
 * @param targetUserId - ID of the user whose role request is being rejected.
 * @param requestedRole - The role that was requested by the user.
 * @param currentRole - The current role of the user to validate consistency.
 * @param rejectReason - Optional reason for rejection.
 * 
 * @returns Promise containing success status, HTTP status code, message, and null data.
 */

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
    // Step 1: Authenticate and authorize action performer
    const { userId: actionPerformerId } = await getCookiesFromServer();

    if (!actionPerformerId) {
      return {
        success: false,
        status: 404,
        message: "Action performer id is missing",
        data: null,
      };
    }

    const performerSnap = await adminDb.collection("users").doc(actionPerformerId).get();
    if (!performerSnap.exists || performerSnap.data()?.user_type !== "UPPER_TRUSTIE") {
      return {
        success: false,
        status: 403,
        message: "Only UpperTrustie can reject role upgrades.",
        data: null,
      };
    }

    // Step 2: Validate the target user and ensure current role matches
    const targetRef = adminDb.collection("users").doc(targetUserId);
    const targetSnap = await targetRef.get();
    const target = targetSnap.data();

    if (!targetSnap.exists) {
      return {
        success: false,
        status: 404,
        message: "Target user not found.",
        data: null,
      };
    }

    if (target?.user_type !== currentRole) {
      return {
        success: false,
        status: 400,
        message: `User role mismatch. Expected '${currentRole}', found '${target?.user_type}'`,
        data: null,
      };
    }

    // Step 3: Look for a pending role request matching the target user and role
    const reqSnap = await adminDb.collection("role_requests")
      .where("userId", "==", targetUserId)
      .where("requestedRole", "==", requestedRole)
      .where("status", "==", "pending")
      .get();

    if (reqSnap.empty) {
      return {
        success: false,
        status: 404,
        message: "No pending role request found for this user and role.",
        data: null,
      };
    }

    // Step 4: Move the request to role_requests_history and delete from active requests
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

    // Step 5: Send rejection email to the user
    const performer = performerSnap.data();
    const performerName = performer?.name ?? 'Admin';
    const performerEmail = performer?.email ?? 'not found';

    const reason = rejectReason || 'No reason provided';
    const html = RoleRequestRejectedEmail(target?.name, requestedRole, reason, performerName, performerEmail);

    if (target?.email) {
      await sendEmail(
        target.email,
        'Role Request Rejected – Hussaini Welfare Association',
        html
      );
    }

    return {
      success: true,
      status: 200,
      message: "Role request rejected successfully.",
      data: null,
    };
  } catch (error: unknown) {
    // Handle unexpected errors
    console.error("rejectRoleRequest error:", error);
    return {
      success: false,
      status: 500,
      message: getErrorMessage(error),
      data: null,
    };
  }
}


/**
 * getRoleRequestHistory
 * ----------------------
 * Fetches the role request history for a given user from the `role_requests_history` collection.
 * 
 * The function:
 * 1. Validates the input userId.
 * 2. Queries Firestore for all role request history documents for that user.
 * 3. Sorts results by `reviewedAt` in descending order (most recent first).
 * 4. Maps and formats the document data into a clean array with fallbacks for missing fields.
 * 
 * @param userId - The ID of the user whose role request history is to be fetched.
 * 
 * @returns A response object with success status, HTTP status code, message, and the history data array.
 */

export async function getRoleRequestHistory(userId: string) {
  // Step 1: Validate input
  if (!userId) {
    return {
      success: false,
      status: 400,
      message: 'User ID is required',
    };
  }

  try {
    // Step 2: Query the role_requests_history collection for the given user
    const snapshot = await adminDb
      .collection('role_requests_history')
      .where('userId', '==', userId)
      .orderBy('reviewedAt', 'desc')
      .get();

    // Step 3: Handle case where no history is found
    if (snapshot.empty) {
      return {
        success: true,
        status: 200,
        message: 'No role request history found',
        data: [],
      };
    }

    // Step 4: Format the documents into a structured array
    const historyData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: userId,
        name: data?.name || "",                  // Fallback if name is missing
        message: data?.message || "",            // Fallback if message is missing
        currentRole: data?.currentRole || "",    // Fallback if currentRole is missing
        requestedRole: data?.requestedRole || "",// Fallback if requestedRole is missing
        status: data?.status || "rejected",      // Default to rejected if undefined
        reviewedBy: data?.reviewedBy || "",
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
    // Step 5: Handle and report unexpected errors
    return {
      success: false,
      status: 500,
      message: getErrorMessage(error),
    };
  }
}

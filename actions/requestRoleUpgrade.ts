'use server'

import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getErrorMessage } from '@/utils/helpers'
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

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

        const currentRole = userData.role || 'REGULAR'

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
        await adminDb.collection('role_requests').add({
            userId,
            currentRole,
            requestedRole,
            message,
            status: 'pending',
            createdAt: Timestamp.now(),
        })

        // Update user's applied_roles (for tracking)
        await adminDb.collection('users').doc(userId).update({
            applied_roles: FieldValue.arrayUnion(requestedRole),
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

type RoleRequest = {
    id: string;
    userId: string;
    requestedRole: string;
    createdAt: any; // Firestore Timestamp
};

export async function getAllRoleRequests({
    pageSize = 10,
    cursor = null,
}: {
    pageSize?: number;
    cursor?: string | null;
}): Promise<{ data: RoleRequest[]; nextCursor: string | null }> {
    const colRef = collection(db, "role_requests");

    let q;

    if (cursor) {
        // To paginate, get the document snapshot to start after
        // cursor is ISO string, convert to Date and query for the doc after that
        // but Firestore startAfter requires a document snapshot or field value(s)
        // simplest is to query the document with createdAt == cursor and startAfter that doc

        // Query one doc with the cursor timestamp
        const cursorDate = new Date(cursor);

        // Firestore startAfter can use the field value directly
        q = query(
            colRef,
            orderBy("createdAt", "asc"),
            startAfter(cursorDate),
            limit(pageSize)
        );
    } else {
        q = query(colRef, orderBy("createdAt", "asc"), limit(pageSize));
    }

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as RoleRequest[];

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc
        ? lastDoc.data().createdAt.toDate().toISOString()
        : null;

    return { data, nextCursor };
}

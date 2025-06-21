"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { sendEmail } from "@/utils/mail";
import { RoleChangeNotificationEmail } from "@/utils/MailTemplates";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export const findUserByNameOrEmail = async (searchTerm: string) => {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('userId')?.value;

        if (!searchTerm) {
            return { success: false, message: "Search term required", status: 400 };
        }

        const term = searchTerm.toLowerCase();
        const usersRef = adminDb.collection("users");

        const [nameSnap, emailSnap] = await Promise.all([
            usersRef
                .where("name", ">=", term)
                .where("name", "<=", term + "\uf8ff")
                .select("id", "name", "email", "photoURL", "user_type")
                .get(),

            usersRef
                .where("email", ">=", term)
                .where("email", "<=", term + "\uf8ff")
                .select("id", "name", "email", "photoURL", "user_type")
                .get(),
        ]);

        const nameResults = nameSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            user_type: doc.data().user_type,
            photoURL: doc.data().photoURL
        }));
        const emailResults = emailSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            user_type: doc.data().user_type,
            photoURL: doc.data().photoURL
        }));

        const combined = [...nameResults, ...emailResults];


        // Remove duplicates and exclude current user
        const uniqueUsers = Array.from(
            new Map(combined.map((user) => [user.id, user])).values()
        ).filter((user) => user.id !== userId);

        return {
            success: true,
            status: 200,
            data: uniqueUsers,
            message: uniqueUsers.length ? "Users found." : "No matching users.",
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
};


export const manageMemberRole = async (
    targetedUserId: string,
    currentRole: string,
    upgradedRole: string,
    message: string
) => {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('userId')?.value;

        if (!userId) {
            return {
                success: false,
                message: "User ID is missing. Unauthorized access.",
                status: 400,
            };
        }

        const userSnapshot = await adminDb.collection('users').doc(userId).get();
        const user = userSnapshot.data();

        if (!user) {
            return {
                success: false,
                message: "User not found.",
                status: 404,
            };
        }

        if (user.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                status: 403,
                message: "Only UpperTrustie can approve role upgrades.",
            };
        }

        const targetRef = adminDb.collection("users").doc(targetedUserId);
        const targetSnap = await targetRef.get();

        if (!targetSnap.exists) {
            return {
                success: false,
                message: "Target user not found.",
                status: 404,
            };
        }

        const target = targetSnap.data();

        await targetRef.update({ user_type: upgradedRole });

        await adminDb.collection("role_requests_history").add({
            currentRole,
            message,
            name: target?.name,
            requestedRole: upgradedRole,
            reviewedAt: Timestamp.now(),
            reviewedBy: userId,
            status: 'accepted',
        });

        const html = RoleChangeNotificationEmail(
            target?.name,
            currentRole,
            upgradedRole,
            message,
            user?.name,
            user?.email
        );

        if (target?.email) {
            await sendEmail(
                target?.email,
                'Role Update Notification - Hussaini Welfare Association',
                html
            );
        }

        return {
            success: true,
            status: 200,
            message: 'Role change successful',
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
};

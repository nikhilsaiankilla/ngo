"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getCookiesFromServer } from "@/lib/serverUtils";
import { getErrorMessage } from "@/utils/helpers";
import { sendEmail } from "@/utils/mail";
import { RoleChangeNotificationEmail } from "@/utils/MailTemplates";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Searches for users by matching name or email.
 * 
 * - Fetches users from Firestore whose `name` or `email` fields match the provided search term.
 * - Case-insensitive partial match using Firestore range queries.
 * - Removes duplicates and excludes the currently logged-in user from the results.
 * 
 * @param searchTerm - The name or email to search for.
 * @returns An object with a success flag, HTTP status code, message, and matching user data.
 */
export const findUserByNameOrEmail = async (searchTerm: string) => {
    try {
        // Get current userId from cookies
        const { userId } = await getCookiesFromServer();

        // Validate input
        if (!searchTerm) {
            return { success: false, message: "Search term required", status: 400 };
        }

        const term = searchTerm.toLowerCase();
        const usersRef = adminDb.collection("users");

        // Perform parallel Firestore queries for both name and email
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

        // Map Firestore documents to user objects
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

        // Remove duplicates by user ID and exclude current user
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
        // Handle and log unexpected errors
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
};


/**
 * Manages a member's role within the system.
 * 
 * - Only users with the role "UPPER_TRUSTIE" are allowed to perform role upgrades.
 * - Validates the current user and the targeted user.
 * - Updates the user's role in Firestore.
 * - Records the role change event in the `role_requests_history` collection.
 * - Sends an email notification to the affected user.
 * 
 * @param targetedUserId - The ID of the user whose role is being changed.
 * @param currentRole - The current role of the targeted user.
 * @param upgradedRole - The new role to assign to the user.
 * @param message - A message describing the reason for the change.
 * @returns A response object indicating success/failure and status code.
 */
export const manageMemberRole = async (
    targetedUserId: string,
    currentRole: string,
    upgradedRole: string,
    message: string
) => {
    try {
        // Extract current user's ID from cookies (server-side)
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "User ID is missing. Unauthorized access.",
                status: 400,
            };
        }

        // Fetch current user's data to verify permissions
        const userSnapshot = await adminDb.collection('users').doc(userId).get();
        const user = userSnapshot.data();

        if (!user) {
            return {
                success: false,
                message: "User not found.",
                status: 404,
            };
        }

        // Only users with UPPER_TRUSTIE role can perform upgrades
        if (user.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                status: 403,
                message: "Only UpperTrustie can approve role upgrades.",
            };
        }

        // Get the targeted user's reference and snapshot
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

        // Update the targeted user's role
        await targetRef.update({ user_type: upgradedRole });

        // Log the role change in the role_requests_history collection
        await adminDb.collection("role_requests_history").add({
            currentRole,
            message,
            name: target?.name,
            requestedRole: upgradedRole,
            reviewedAt: Timestamp.now(),
            reviewedBy: userId,
            status: 'accepted',
        });

        // Prepare and send role change notification email
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
                target.email,
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


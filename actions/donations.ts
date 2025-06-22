"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { getCookiesFromServer } from "@/lib/serverUtils";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Retrieves donation records for a specific user and year, formatted for download.
 * @param year - The year for which to fetch donation records.
 * @returns A promise resolving to a ServerActionResponse containing an array of donation records or an error message.
 */
export async function downloadDonations(year: number) {
    // Retrieve userId from server cookies
    const { userId } = await getCookiesFromServer();

    // Validate user authentication
    if (!userId) {
        return {
            success: false,
            message: "Unauthorized",
            status: 401 // Unauthorized access
        };
    }

    try {
        // Fetch user document from Firestore
        const userSnap = await adminDb.collection("users").doc(userId).get();
        const email = userSnap.data()?.email;
        // Check if user email exists
        if (!email) {
            return {
                success: false,
                message: "User not found",
                status: 404 // Resource not found
            };
        }

        // Define start and end timestamps for the specified year
        const start = Timestamp.fromDate(new Date(`${year}-01-01T00:00:00Z`));
        const end = Timestamp.fromDate(new Date(`${year + 1}-01-01T00:00:00Z`));

        // Query transactions for the user's email within the specified year
        const snapshot = await adminDb
            .collection("transactions")
            .where("email", "==", email)
            .where("timestamp", ">=", start)
            .where("timestamp", "<", end)
            .get();

        // Check if any donations were found
        if (snapshot.empty) {
            return {
                success: false,
                message: "No donations found",
                status: 404 // Resource not found
            };
        }

        // Format donation data for download
        const donations = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                razorpay_payment_id: data.razorpay_payment_id || "-",
                amount: data.amount || 0,
                method: data.method || "-",
                status: data.status || "-",
                timestamp: data.timestamp.toDate().toLocaleString(),
                invoice_url: data.invoice_url || "-",
            };
        });

        // Return success response with donation data
        return {
            success: true,
            data: donations,
            message: "Donations fetched successfully",
            status: 200 // OK
        };
    } catch (err) {
        // Handle any errors during the process
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500 // Internal server error
        };
    }
}
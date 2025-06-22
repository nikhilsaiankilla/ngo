"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { APIResponse, DonationStats, GrowthByMonth, UserTypeDistributionTypes } from "@/types";

/**
 * Retrieves user growth data for a specific user type across all 12 months of a given year.
 * @param year - The year for which to fetch user growth data.
 * @param type - The user type to filter the growth data.
 * @returns A promise resolving to an APIResponse containing an array of GrowthByMonth objects or an error message.
 */
export async function getUserGrowthByType(year: number, type: string): Promise<APIResponse<GrowthByMonth[]>> {
    try {
        // Initialize array to store monthly growth results
        const results: GrowthByMonth[] = [];

        // Iterate through each month (0-11) to query user counts
        for (let month = 0; month < 12; month++) {
            // Define start and end dates for the current month
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            // Construct Firestore query to count users of the specified type created within the month
            const q = adminDb.collection("users")
                .where("user_type", "==", type)
                .where("createdAt", ">=", Timestamp.fromDate(start))
                .where("createdAt", "<", Timestamp.fromDate(end));

            // Execute query to get the count of matching users
            const snapshot = await q.count().get();

            // Add formatted month and count to results
            results.push({
                month: `${year}-${String(month + 1).padStart(2, "0")}`,
                count: snapshot.data()?.count ?? 0,
            });
        }

        // Return success response with growth data
        return {
            success: true,
            status: 200,
            message: "Fetched successfully",
            data: results,
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Failed to fetch members growth:", error);
        // Return error response
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Retrieves user growth data for all user types except "REGULAR" across all 12 months of a given year.
 * @param year - The year for which to fetch user growth data.
 * @returns A promise resolving to an APIResponse containing an array of GrowthByMonth objects or an error message.
 */
export async function getUserGrowth(year: number): Promise<APIResponse<GrowthByMonth[]>> {
    try {
        // Initialize array to store monthly growth results
        const results: GrowthByMonth[] = [];

        // Iterate through each month (0-11) to query user counts
        for (let month = 0; month < 12; month++) {
            // Define start and end dates for the current month
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            // Construct Firestore query to count users excluding "REGULAR" type created within the month
            const q = adminDb.collection("users")
                .where("user_type", "!=", "REGULAR")
                .where("createdAt", ">=", Timestamp.fromDate(start))
                .where("createdAt", "<", Timestamp.fromDate(end))
                .orderBy("user_type"); // Required for inequality queries in Firestore

            // Execute query to get the count of matching users
            const snapshot = await q.count().get();

            // Add formatted month and count to results
            results.push({
                month: `${year}-${String(month + 1).padStart(2, "0")}`,
                count: snapshot.data()?.count ?? 0,
            });
        }

        // Return success response with growth data
        return {
            success: true,
            status: 200,
            message: "Fetched successfully",
            data: results,
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Failed to fetch user growth:", error);
        // Return error response
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Retrieves donation totals and counts by month for a specified year.
 * @param year - The year for which to fetch donation data.
 * @returns A promise resolving to an APIResponse containing monthly donation statistics and the total amount for the year.
 */
export async function getDonationsByYear(year: number): Promise<APIResponse<{ results: DonationStats[]; totalAmountThisYear: number }>> {
    try {
        // Initialize array to store monthly donation statistics
        const results: DonationStats[] = [];
        // Reference to the transactions collection in Firestore
        const donationsRef = adminDb.collection("transactions");
        // Initialize variable to track total donation amount for the year
        let totalAmountThisYear = 0;

        // Iterate through each month (0-11) to query donation data
        for (let month = 0; month < 12; month++) {
            // Define start and end dates for the current month
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            // Query successful and captured transactions within the month
            const snapshot = await donationsRef
                .where("status", "==", "success")
                .where("captured", "==", true)
                .where("timestamp", ">=", Timestamp.fromDate(start))
                .where("timestamp", "<", Timestamp.fromDate(end))
                .get();

            // Calculate total donation amount for the month
            let monthlyTotal = 0;
            snapshot.forEach(doc => {
                monthlyTotal += doc.data().amount || 0;
            });

            // Add monthly statistics to results
            results.push({
                month: `${year}-${String(month + 1).padStart(2, "0")}`,
                total: monthlyTotal,
                count: snapshot.size,
            });

            // Update yearly total
            totalAmountThisYear += monthlyTotal;
        }

        // Return success response with monthly results and yearly total
        return {
            success: true,
            status: 200,
            message: "Monthly donation data fetched successfully",
            data: {
                results,
                totalAmountThisYear,
            },
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Failed to fetch donations:", error);
        // Return error response
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Retrieves the distribution of user counts by user type for a specified year.
 * @param year - The year for which to fetch user type counts.
 * @returns A promise resolving to an APIResponse containing an array of user type distributions or an error message.
 */
export async function getUserTypeCounts(year: number): Promise<APIResponse<UserTypeDistributionTypes[]>> {
    try {
        // Define start and end timestamps for the specified year
        const start = Timestamp.fromDate(new Date(`${year}-01-01T00:00:00Z`));
        const end = Timestamp.fromDate(new Date(`${year + 1}-01-01T00:00:00Z`));

        // Query users created within the specified year
        const snapshot = await adminDb.collection("users")
            .where("createdAt", ">=", start)
            .where("createdAt", "<", end)
            .get();

        // Initialize a map to track counts by user type
        const typeMap: Record<string, number> = {};

        // Aggregate counts by user type, defaulting to "REGULAR" if user_type is undefined
        snapshot.forEach((doc) => {
            const type = doc.data().user_type || "REGULAR";
            typeMap[type] = (typeMap[type] || 0) + 1;
        });

        // Convert type map to array of user type distribution objects
        const counts: UserTypeDistributionTypes[] = Object.entries(typeMap).map(
            ([userType, count]) => ({ userType, count })
        );

        // Return success response with user type counts
        return {
            success: true,
            status: 200,
            message: `User type counts for ${year} fetched`,
            data: counts,
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Error fetching user type counts:", error);
        // Return error response
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}
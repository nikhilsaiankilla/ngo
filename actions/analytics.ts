"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getUserGrowthByType(year: number, type: string) {
    try {
        const results: { month: string; count: number }[] = [];

        for (let month = 0; month < 12; month++) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            const startTimestamp = Timestamp.fromDate(start);
            const endTimestamp = Timestamp.fromDate(end);

            const usersRef = adminDb.collection('users');

            // Add user_type filter here
            const q = usersRef
                .where('user_type', '==', type)
                .where('createdAt', '>=', startTimestamp)
                .where('createdAt', '<', endTimestamp);

            const snapshot = await q.count().get();

            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

            results.push({
                month: monthKey,
                count: snapshot.data()?.count ?? 0,
            });
        }

        return { success: true, message: 'Fetched successfully', status: 200, data: results };
    } catch (error: unknown) {
        console.error("Failed to fetch members growth:", error);
        return { success: false, message: getErrorMessage(error), status: 500 };
    }
}

export async function getUserGrowth(year: number) {
    try {
        const results: { month: string; count: number }[] = [];

        for (let month = 0; month < 12; month++) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            const startTimestamp = Timestamp.fromDate(start);
            const endTimestamp = Timestamp.fromDate(end);

            const usersRef = adminDb.collection('users');

            const q = usersRef
                .where('user_type', '!=', "REGULAR")
                .where('createdAt', '>=', startTimestamp)
                .where('createdAt', '<', endTimestamp)
                .orderBy('user_type')

            const snapshot = await q.count().get();

            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

            results.push({
                month: monthKey,
                count: snapshot.data()?.count ?? 0,
            });
        }

        return { success: true, message: 'Fetched successfully', status: 200, data: results };
    } catch (error: unknown) {
        console.error("Failed to fetch members growth:", error);
        return { success: false, message: getErrorMessage(error), status: 500 };
    }
}

type DonationStats = {
    month: string;
    total: number;
    count: number;
};

export async function getDonationsByYear(year: number) {
    try {
        const results: DonationStats[] = [];
        const donationsRef = adminDb.collection('transactions');
        let totalAmountThisYear = 0;

        for (let month = 0; month < 12; month++) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 1);

            const startTimestamp = Timestamp.fromDate(start);
            const endTimestamp = Timestamp.fromDate(end);

            const snapshot = await donationsRef
                .where('status', '==', 'success')
                .where('captured', '==', true)
                .where('timestamp', '>=', startTimestamp)
                .where('timestamp', '<', endTimestamp)
                .get();

            let monthlyTotal = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                monthlyTotal += data.amount || 0;
            });

            results.push({
                month: `${year}-${String(month + 1).padStart(2, '0')}`,
                total: monthlyTotal,
                count: snapshot.size,
            });

            totalAmountThisYear += monthlyTotal;
        }

        return {
            success: true,
            message: 'Monthly donation data fetched successfully',
            status: 200,
            data: {
                results,
                totalAmountThisYear,
            },
        };
    } catch (error: unknown) {
        console.error('Failed to fetch donations:', error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

type UserTypeDistributionTypes = {
    userType: string,
    count: number
}

export async function getUserTypeCounts(year: number) {
    try {
        const start = Timestamp.fromDate(new Date(`${year}-01-01T00:00:00Z`));
        const end = Timestamp.fromDate(new Date(`${year + 1}-01-01T00:00:00Z`));

        const usersQuery = adminDb
            .collection("users")
            .where("createdAt", ">=", start)
            .where("createdAt", "<", end);

        const snapshot = await usersQuery.get();

        // Use a temporary map to count first
        const typeMap: Record<string, number> = {};

        snapshot.forEach((doc) => {
            const type = doc.data().user_type || "REGULAR";
            typeMap[type] = (typeMap[type] || 0) + 1;
        });

        // Convert to array format
        const counts: UserTypeDistributionTypes[] = Object.entries(typeMap).map(
            ([userType, count]) => ({ userType, count })
        );
        
        return {
            success: true,
            status: 200,
            message: `User type counts for ${year} fetched`,
            data: counts,
        };
    } catch (error: unknown) {
        console.error("Error fetching user type counts:", error);
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

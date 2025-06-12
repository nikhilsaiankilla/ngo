"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";

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

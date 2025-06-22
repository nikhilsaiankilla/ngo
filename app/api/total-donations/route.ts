// src/app/api/total-donations/route.ts

import { adminDb } from '@/firebase/firebaseAdmin';
import { getErrorMessage } from '@/utils/helpers';
import { NextResponse } from 'next/server';

/**
 * GET /api/total-donations
 * 
 * This endpoint retrieves the total amount of donations recorded in the Firestore database.
 * 
 * Data is stored in the 'totals' collection under the document 'transactions',
 * where the field `totalAmount` tracks the cumulative donation amount.
 * 
 * Returns:
 * - 200: On successful retrieval (even if no donations exist yet).
 * - 500: On any server/database error.
 */
export async function GET() {
    try {
        // Reference the document containing total donation stats
        const docRef = adminDb.collection('totals').doc('transactions');
        const docSnap = await docRef.get();

        /**
         * If the document does not exist, it likely means no donations
         * have been recorded yet. We return a default value of 0.
         */
        if (!docSnap.exists) {
            console.warn("Document 'transactions' does not exist in 'totals' collection.");
            return NextResponse.json({
                success: true,
                message: "No donations recorded yet",
                status: 200,
                data: 0,
            });
        }

        // Safely extract totalAmount from document data
        const data = docSnap.data();
        const totalAmount = data?.totalAmount ?? 0;

        // Return total donation amount with a success message
        return NextResponse.json({
            success: true,
            message: "Successfully fetched total donations",
            status: 200,
            data: totalAmount,
        });

    } catch (error: unknown) {
        /**
         * Catch any unexpected errors (e.g., Firestore errors, network issues)
         * and return a structured server error response.
         */
        console.error('Failed to fetch total donations:', error);

        return NextResponse.json({
            success: false,
            message: getErrorMessage(error),
            status: 500,
        });
    }
}

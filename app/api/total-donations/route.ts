// src/app/api/total-donations/route.ts
import { adminDb } from '@/firebase/firebaseAdmin';
import { getErrorMessage } from '@/utils/helpers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const doc = await adminDb.collection('totals').doc('transactions').get();
        const data = doc.data();
        const totalAmount = data?.totalAmount || 0;

        return NextResponse.json({
            success: true,
            message: "Successfully fetched total donations",
            status: 200,
            data: totalAmount,
        });
    } catch (error: unknown) {
        console.error('Failed to fetch total donations:', error);
        return NextResponse.json({
            success: false,
            message: getErrorMessage(error),
            status: 500,
        });
    }
}

'use server';

import { adminDb } from '@/firebase/firebaseAdmin';
import { getErrorMessage } from '@/utils/helpers';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Your Transaction interface fields simplified in schema
const manualDonationSchema = z.object({
    donorName: z.string().optional().nullable(),
    amount: z.number().positive(),
    method: z.string().optional().nullable(),
    notes: z.record(z.any()).optional().nullable(),
});

export async function addManualDonation(formData: FormData) {
    try {
        const data = manualDonationSchema.parse({
            donorName: formData.get('donorName') || null,
            amount: Number(formData.get('amount')),
            method: formData.get('method') || null,
            notes: formData.get('notes')
                ? { notes: formData.get('notes') }
                : null,
        });

        const cookiesStore = await cookies();
        const userId = cookiesStore.get('userId')?.value;

        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized: User ID not found in cookies.',
                status: 400
            };
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();
        const user = userDoc.data();

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
                status: 404
            };
        }

        if (user?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: 'Forbidden: Insufficient permissions.',
                status: 400
            };
        }

        const newDonation = {
            userId: null, // since manual donation may not be linked to a user
            razorpay_order_id: null,
            razorpay_payment_id: `manual_${data.method?.toLowerCase() || 'cash'}_${Date.now()}`,
            razorpay_signature: null,
            status: 'success',
            reason: 'Manual donation recorded',
            amount: data.amount,
            currency: 'INR',
            method: data.method,
            email: null,
            contact: null,
            notes: data.notes || {},
            fee: 0,
            tax: 0,
            captured: true,

            created_at: Date.now(),
            timestamp: new Date(),
            donor_name: data.donorName || null,
            recordedBy: userId,
        };

        await adminDb.collection('transactions').add(newDonation);

        return {
            success: true,
            message: 'Manual donation recorded successfully.',
            status: 200,
            data: newDonation
        };
    } catch (error: unknown) {
        console.error('Error recording manual donation:', error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500
        };
    }
}

'use server';

import { adminDb } from '@/firebase/firebaseAdmin';
import { getErrorMessage } from '@/utils/helpers';
import { FieldValue } from 'firebase-admin/firestore';
import { manualDonationSchema } from '@/validations'
import { getCookiesFromServer } from '@/lib/serverUtils';

/**
 * Records a manual donation in the database, restricted to users with 'UPPER_TRUSTIE' role.
 * @param formData - FormData containing donation details (donorName, amount, method, notes).
 * @returns A promise resolving to a ServerActionResponse containing the result of the donation recording process.
 */
export async function addManualDonation(formData: FormData) {
    try {
        // Validate and parse form data using Zod schema
        const data = manualDonationSchema.parse({
            donorName: formData.get('donorName') || null,
            amount: Number(formData.get('amount')),
            method: formData.get('method') || null,
            notes: formData.get('notes') ? { notes: formData.get('notes') } : null,
        });

        // Retrieve userId from cookies
        const { userId } = await getCookiesFromServer();

        // Validate user authentication
        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized: User ID not found in cookies.',
                status: 400,
            };
        }

        // Fetch user details from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const user = userDoc.data();

        // Check if user exists
        if (!user) {
            return {
                success: false,
                message: 'User not found.',
                status: 404,
            };
        }

        // Restrict access to users with 'UPPER_TRUSTIE' role
        if (user?.user_type !== 'UPPER_TRUSTIE') {
            return {
                success: false,
                message: 'Forbidden: Insufficient permissions.',
                status: 400,
            };
        }

        // Construct the manual donation object
        const newDonation = {
            userId: null, // Manual donations are not linked to a specific user
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

        // Add the donation to the 'transactions' collection in Firestore
        await adminDb.collection('transactions').add(newDonation);

        // Increment the total donation amount in the 'totals' document
        await adminDb.collection('totals').doc('transactions').set(
            {
                totalAmount: FieldValue.increment(newDonation.amount),
            },
            { merge: true } // Merge with existing data to avoid overwriting
        );

        // Return success response with donation details
        return {
            success: true,
            message: 'Manual donation recorded successfully.',
            status: 200,
            data: newDonation,
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error('Error recording manual donation:', error);
        // Return error response
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}
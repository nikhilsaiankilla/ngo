import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { DonationConfirmationEmail } from "@/utils/MailTemplates";
import { sendEmail } from "@/utils/mail";

// Initialize Razorpay instance with secret credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define expected request body structure
interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    name: string,
    email: string,
}

// Define transaction interface for Firestore logging
export interface Transaction {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    status: "success" | "failed" | "pending";
    invoiceId?: string;
    invoice_url?: string;
    reason?: string;
    amount?: number;
    currency?: string;
    method?: string;
    email: string;
    contact?: string;
    notes?: Record<string, string>;
    fee?: number;
    tax?: number;
    captured?: boolean;
    created_at?: number;
    timestamp: Timestamp;
}

// POST handler to verify payment and log transaction
export async function POST(request: NextRequest) {
    const transactionsRef = adminDb.collection("transactions");

    try {
        // Extract data from request body
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            name,
            email,
        }: VerifyBody = await request.json();

        // Validate presence of essential Razorpay parameters
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            // Log failed transaction due to missing params
            await transactionsRef.add({
                email: "",
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Missing required Razorpay parameters",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            // Return 400 response
            return NextResponse.json(
                { error: "Missing required parameters", success: false },
                { status: 400 }
            );
        }

        // Create expected signature using Razorpay secret
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        // Compare generated signature with received one
        if (generatedSignature !== razorpay_signature) {
            // Log failed transaction due to invalid signature
            await transactionsRef.add({
                email: "",
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Invalid signature",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            // Return 400 response
            return NextResponse.json(
                { error: "Invalid signature", success: false },
                { status: 400 }
            );
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // If email is not present, log failure
        if (!email) {
            await transactionsRef.add({
                email: "",
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Email not found in payment details",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "Email not found in payment", success: false },
                { status: 400 }
            );
        }

        // Log successful transaction in Firestore
        await transactionsRef.add({
            email,
            razorpay_order_id,
            razorpay_payment_id: payment.id,
            razorpay_signature,
            amount: Number(payment.amount) / 100,
            currency: payment.currency,
            status: "success",
            method: payment.method,
            contact: payment.contact?.toString(),
            notes: payment.notes,
            fee: payment.fee,
            tax: payment.tax,
            captured: payment.captured,
            created_at: payment.created_at,
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        // Increment total donated amount
        await adminDb.collection("totals").doc("transactions").set(
            {
                totalAmount: FieldValue.increment(Number(payment.amount) / 100),
            },
            { merge: true }
        );

        try {
            // Send confirmation email to donor
            if (email) {
                const amount = Number(payment?.amount) / 100;
                const html = DonationConfirmationEmail(name, email, amount, 'Thank you for your generous contribution. Your support empowers us to continue our mission and make a meaningful impact. We truly appreciate your kindness and belief in our cause.')

                await sendEmail(email, 'Your Donation Has Been Received – Thank You for Your Support! Hussaini Welfare Association', html)
            }
        } finally {
            // mail sent 
        }

        // Return success response with payment info
        return NextResponse.json({
            message: "Payment verified successfully",
            success: true,
            status: 200,
            data: {
                payment_id: payment.id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email,
                contact: payment.contact,
                notes: payment.notes,
            },
        });
    } catch (error: unknown) {
        // Log any unexpected error as a failed transaction
        await transactionsRef.add({
            email: "",
            status: "failed",
            reason: getErrorMessage(error),
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        // Return 500 error response
        return NextResponse.json(
            { error: getErrorMessage(error), success: false },
            { status: 500 }
        );
    }
}

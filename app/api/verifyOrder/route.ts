import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { cookies } from "next/headers";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";

// Initialize Razorpay instance with API credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!, // Razorpay Key ID from environment variables
    key_secret: process.env.RAZORPAY_KEY_SECRET!, // Razorpay Key Secret from environment variables
});

// Define interface for the request body
interface VerifyBody {
    razorpay_order_id: string; // Razorpay order ID
    razorpay_payment_id: string; // Razorpay payment ID
    razorpay_signature: string; // Razorpay signature for verification
}

// Define Firestore transaction document interface
export interface Transaction {
    userId: string | null; // User ID from cookies, null if missing
    razorpay_order_id?: string; // Razorpay order ID
    razorpay_payment_id?: string; // Razorpay payment ID
    razorpay_signature?: string; // Razorpay signature
    status: "success" | "failed" | "pending"; // Transaction status
    reason?: string; // Reason for failure, if applicable
    amount?: number; // Payment amount in primary currency unit (e.g., INR)
    currency?: string; // Currency code (e.g., INR)
    method?: string; // Payment method (e.g., netbanking)
    email?: string; // Payer's email
    contact?: string; // Payer's contact number
    notes?: Record<string, string>; // Additional notes from Razorpay
    fee?: number; // Transaction fee
    tax?: number; // Tax amount
    captured?: boolean; // Whether the payment was captured
    created_at?: number; // Unix timestamp of payment creation
    timestamp: Timestamp; // Firestore timestamp for when the transaction was recorded
}

// POST handler for payment verification
export async function POST(request: NextRequest) {
    // Reference to Firestore transactions collection
    const transactionsRef = adminDb.collection("transactions");

    try {
        // Parse request body to extract Razorpay parameters
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }: VerifyBody = await request.json();

        // Retrieve userId from cookies
        const cookiesStore = await cookies();
        const userId = cookiesStore.get("userId")?.value || null;

        // Validate userId presence
        if (!userId) {
            // Log failure to Firestore if userId is missing
            await transactionsRef.add({
                userId: null,
                status: "failed",
                reason: "User ID missing in cookies",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "User ID is missing", success: false },
                { status: 400 }
            );
        }

        // Verify user exists in Firestore
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const user = userDoc.data();

        if (!user) {
            // Log failure if user document not found
            await transactionsRef.add({
                userId,
                status: "failed",
                reason: "User not found in Firestore",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "User not found", success: false },
                { status: 404 }
            );
        }

        // Check for missing Razorpay parameters
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            // Log failure if any required Razorpay parameter is missing
            await transactionsRef.add({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Missing required Razorpay parameters",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "Missing required parameters", success: false },
                { status: 400 }
            );
        }

        // Validate Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}| ${razorpay_payment_id} `); // Generate HMAC for verification
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            // Log failure if signature is invalid
            await transactionsRef.add({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Invalid signature",
                timestamp: Timestamp.now(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "Invalid signature", success: false },
                { status: 400 }
            );
        }

        // Fetch payment details from Razorpay API
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Save successful transaction to Firestore
        await transactionsRef.add({
            userId,
            razorpay_order_id,
            razorpay_payment_id: payment.id,
            razorpay_signature,
            amount: Number(payment.amount) / 100, // Convert paise to rupees
            currency: payment.currency,
            status: "success",
            method: payment.method,
            email: payment.email,
            contact: payment.contact?.toString(),
            notes: payment.notes,
            fee: payment.fee,
            tax: payment.tax,
            captured: payment.captured,
            created_at: payment.created_at,
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        // Return success response with payment details
        return NextResponse.json({
            message: "Payment verified successfully",
            success: true,
            data: {
                payment_id: payment.id,
                amount: Number(payment.amount) / 100, // Convert paise to rupees
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                notes: payment.notes,
            },
        });
    } catch (error: unknown) {
        // Retrieve userId again for error logging
        const userId = (await cookies()).get("userId")?.value || null;

        // Log unexpected errors to Firestore
        await transactionsRef.add({
            userId,
            status: "failed",
            reason: getErrorMessage(error),
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        // Return error response
        return NextResponse.json(
            { error: getErrorMessage(error), success: false },
            { status: 500 }
        );
    }
}
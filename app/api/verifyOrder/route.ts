import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { cookies } from "next/headers";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";

// Initialize Razorpay instance with API credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define interface for the request body
interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// Define Firestore transaction document interface
export interface Transaction {
    userId: string | null;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    status: "success" | "failed" | "pending";
    reason?: string;
    amount?: number;
    currency?: string;
    method?: string;
    email?: string;
    contact?: string;
    notes?: Record<string, string>;
    fee?: number;
    tax?: number;
    captured?: boolean;
    created_at?: number;
    timestamp: Timestamp;
}

// POST handler for payment verification
export async function POST(request: NextRequest) {
    const transactionsRef = adminDb.collection("transactions");

    try {
        // Parse request body
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }: VerifyBody = await request.json();

        // Log incoming request data for debugging
        console.log("Verification request:", {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        // Retrieve userId from cookies
        const cookiesStore = await cookies();
        const userId = cookiesStore.get("userId")?.value || null;

        // Validate userId
        if (!userId) {
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

        // Verify user exists
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const user = userDoc.data();

        if (!user) {
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

        // Validate Razorpay parameters
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`); // Fixed: Removed extra space
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
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

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Save successful transaction
        await transactionsRef.add({
            userId,
            razorpay_order_id,
            razorpay_payment_id: payment.id,
            razorpay_signature,
            amount: Number(payment.amount) / 100,
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
                email: payment.email,
                contact: payment.contact,
                notes: payment.notes,
            },
        });
    } catch (error: unknown) {
        const userId = (await cookies()).get("userId")?.value || null;
        await transactionsRef.add({
            userId,
            status: "failed",
            reason: getErrorMessage(error),
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        console.error("Verification error:", error);
        return NextResponse.json(
            { error: getErrorMessage(error), success: false },
            { status: 500 }
        );
    }
}
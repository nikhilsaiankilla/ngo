import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { cookies } from "next/headers";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { FieldValue } from "firebase-admin/firestore";

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Request body interface
interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// Firestore transaction document interface
interface Transaction {
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
    notes?: Record<string, any>;
    fee?: number;
    tax?: number;
    captured?: boolean;
    created_at?: number;
    timestamp: any;
}

export async function POST(request: NextRequest) {
    const transactionsRef = adminDb.collection("transactions");

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }: VerifyBody = await request.json();

        const cookiesStore = await cookies();
        const userId = cookiesStore.get("userId")?.value || null;

        // If userId missing, reject and log failure
        if (!userId) {
            await transactionsRef.add({
                userId: null,
                status: "failed",
                reason: "User ID missing in cookies",
                timestamp: FieldValue.serverTimestamp(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "User ID is missing", success: false },
                { status: 400 }
            );
        }

        // Validate user exists in Firestore
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const user = userDoc.data();

        if (!user) {
            await transactionsRef.add({
                userId,
                status: "failed",
                reason: "User not found in Firestore",
                timestamp: FieldValue.serverTimestamp(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "User not found", success: false },
                { status: 404 }
            );
        }

        // Check for missing Razorpay parameters
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            await transactionsRef.add({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Missing required Razorpay parameters",
                timestamp: FieldValue.serverTimestamp(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "Missing required parameters", success: false },
                { status: 400 }
            );
        }

        // Validate Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            await transactionsRef.add({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: "failed",
                reason: "Invalid signature",
                timestamp: FieldValue.serverTimestamp(),
            } satisfies Transaction);

            return NextResponse.json(
                { error: "Invalid signature", success: false },
                { status: 400 }
            );
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Save successful transaction to Firestore
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
            timestamp: FieldValue.serverTimestamp(),
        } satisfies Transaction);

        return NextResponse.json({
            message: "Payment verified successfully",
            success: true,
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
    } catch (error) {
        const userId = (await cookies()).get("userId")?.value || null;

        // Log unexpected errors in Firestore
        const transactionsRef = adminDb.collection("transactions");
        await transactionsRef.add({
            userId,
            status: "failed",
            reason: getErrorMessage(error),
            timestamp: FieldValue.serverTimestamp(),
        } satisfies Transaction);

        return NextResponse.json(
            { error: getErrorMessage(error), success: false },
            { status: 500 }
        );
    }
}

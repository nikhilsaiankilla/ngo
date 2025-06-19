import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { createZohoInvoice, getZohoAccessToken, sendInvoiceViaZohoMail } from "@/utils/zoho";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    name: string,
    email: string,
}

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

export async function POST(request: NextRequest) {
    const transactionsRef = adminDb.collection("transactions");

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            name,
            email,
        }: VerifyBody = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            await transactionsRef.add({
                email: "",
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

        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            await transactionsRef.add({
                email: "",
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

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

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

        const donation = await transactionsRef.add({
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

        await adminDb.collection("totals").doc("transactions").set(
            {
                totalAmount: FieldValue.increment(Number(payment.amount) / 100),
            },
            { merge: true }
        );

        let invoice_url = "";

        try {
            const accessToken = await getZohoAccessToken();
            const invoice = await createZohoInvoice({
                accessToken,
                customerEmail: email,
                customerName: name || "Donor",
                amount: Number(payment.amount) / 100,
                paymentId: payment.id,
            });

            const invoiceRef = invoice.invoice;

            if (invoiceRef?.invoice_id) {
                await adminDb.collection("invoices").add({
                    email,
                    zohoInvoiceId: invoiceRef.invoice_id,
                    invoiceNumber: invoiceRef.invoice_number,
                    pdfUrl: `https://invoice.zoho.in/api/v3/invoices/${invoiceRef.invoice_id}?accept=pdf&organization_id=${process.env.ZOHO_ORG_ID}`,
                    amount: Number(payment.amount) / 100,
                    createdAt: Timestamp.now(),
                });

                await sendInvoiceViaZohoMail(invoiceRef.invoice_id, accessToken, email);

                await transactionsRef.doc(donation.id).update({
                    invoiceId: invoiceRef.invoice_id,
                    invoice_url: `https://invoice.zoho.in/api/v3/invoices/${invoiceRef.invoice_id}?accept=pdf&organization_id=${process.env.ZOHO_ORG_ID}`,
                });

                invoice_url = `https://invoice.zoho.in/api/v3/invoices/${invoiceRef.invoice_id}?accept=pdf&organization_id=${process.env.ZOHO_ORG_ID}`
            }
        } catch (error) {
            return NextResponse.json({
                message: "Payment verified successfully but failed to generate or send invoice",
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
        }

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
                invoice: invoice_url
            },
        });
    } catch (error: unknown) {
        await transactionsRef.add({
            email: "",
            status: "failed",
            reason: getErrorMessage(error),
            timestamp: Timestamp.now(),
        } satisfies Transaction);

        return NextResponse.json(
            { error: getErrorMessage(error), success: false },
            { status: 500 }
        );
    }
}

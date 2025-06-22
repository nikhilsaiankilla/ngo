import { OrderBody } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

/**
 * Razorpay instance setup
 */
const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing in environment variables.");
}

const razorpay = new Razorpay({ key_id, key_secret });

/**
 * POST /api/create-order
 * -----------------------
 * Creates a Razorpay order with the specified amount and currency.
 * 
 * @param request - NextRequest object containing JSON with `amount` and optional `currency`
 * @returns JSON response with Razorpay `orderId` or error message
 */
export async function POST(request: NextRequest) {
    try {
        const body: OrderBody = await request.json();
        const { amount, currency = "INR" } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { message: "Amount is required and must be greater than 0." },
                { status: 400 }
            );
        }

        const options = {
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ orderId: order.id }, { status: 200 });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json(
            { message: "Failed to create order", error: (error as Error).message },
            { status: 500 }
        );
    }
}

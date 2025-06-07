"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { createOrderId } from "@/utils/payment";
import axios from 'axios';
import { getUser } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = {
    userId: string;
    name: string;
    email: string;
};

interface UserData {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    createdAt?: any;
    user_type?: string;
}

type Props = {
    userId: string;
};

const DonationForm = ({ userId }: Props) => {
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await getUser(userId);

                if (res?.success && res.data) {
                    const fetchedData = res.data as UserData;

                    const fetchedUser = {
                        ...fetchedData,
                        createdAt: fetchedData.createdAt?.toDate?.().toISOString() || null,
                    };

                    setUser({
                        userId: fetchedUser.id,
                        name: fetchedUser.name,
                        email: fetchedUser.email,
                    });
                } else {
                    toast.error(res?.message);
                }
            } catch (err) {
                toast.error("something went wrong please try again")
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user?.userId || !user?.email || !user?.name) {
            toast.error('User data not available')
            setLoading(false);
            return;
        }

        try {
            const orderId: string = await createOrderId(price, "INR");

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: price * 100,
                currency: "INR",
                name: "NGO",
                description: "A step towards to uplift the people",
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        const paymentResponse = await axios.post("/api/verifyOrder", {
                            razorpay_order_id: orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.success("Payment Successful!")

                        const paymentId = paymentResponse?.data?.payment_id;

                        if (paymentId) {
                            router.push(`/payment-success/${paymentId}`)
                        }
                    } catch (error) {
                        toast.error("Payment verification failed. Please contact support.")
                        console.error(error);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.on("payment.failed", function (response: any) {
                toast.error("Payment failed")
                console.error(response.error);
            });
            razorpay.open();
        } catch (error) {
            alert("Payment failed. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />

            <form
                onSubmit={handlePayment}
                className="bg-white rounded-xl p-6 shadow-md w-full max-w-md space-y-4"
            >
                <h2 className="text-xl font-bold text-gray-800">Make a Donation</h2>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Amount (INR)
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={1}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                    {loading ? "Processing..." : "Donate"}
                </button>
            </form>
        </>
    );
};

export default DonationForm;

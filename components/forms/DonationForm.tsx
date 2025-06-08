"use client";

// Import required dependencies
import React, { useEffect, useState } from "react";
import Script from "next/script"; // For loading Razorpay checkout script
import { createOrderId } from "@/utils/payment"; // Utility to create Razorpay order ID
import axios from "axios"; // For making API requests
import { getUser } from "@/actions/auth"; // Action to fetch user data
import { toast } from "sonner"; // For displaying notifications
import { useRouter } from "next/navigation"; // For client-side navigation
import { Button } from "../ui/button"; // Custom UI button component

// Define Razorpay response type for successful payments
interface RazorpayResponse {
    razorpay_payment_id: string; // Razorpay payment ID
    razorpay_order_id: string; // Razorpay order ID
    razorpay_signature: string; // Razorpay signature for verification
}

// Define Razorpay error type for failed payments
interface RazorpayError {
    error: {
        code: string; // Error code
        description: string; // Error description
        source: string; // Source of the error
        step: string; // Step where the error occurred
        reason: string; // Reason for the error
        metadata: {
            order_id: string; // Associated order ID
            payment_id: string; // Associated payment ID
        };
    };
}

// Extend Window interface to include Razorpay SDK
declare global {
    interface Window {
        Razorpay: new (options) => {
            open: () => void; // Opens the Razorpay checkout modal
            on: (event: string, callback: (response: RazorpayResponse | RazorpayError) => void) => void; // Event listener for payment events
        };
    }
}

// Define User type for component state
type User = {
    userId: string; // User ID
    name: string; // User name
    email: string; // User email
};

// Define UserData type for fetched user data from Firestore
interface UserData {
    id: string; // User ID
    name: string; // User name
    email: string; // User email
    photoURL?: string; // Optional user photo URL
    createdAt?: { _seconds: number; _nanoseconds: number }; // Firebase Timestamp structure
    user_type?: string; // Optional user type
}

// Define component props
type Props = {
    userId: string; // User ID passed as prop
};

// DonationForm component for handling donations via Razorpay
const DonationForm = ({ userId }: Props) => {
    // State for donation amount
    const [price, setPrice] = useState<number>(0);
    // State for loading status
    const [loading, setLoading] = useState(false);
    // State for user data
    const [user, setUser] = useState<User | null>(null);
    // Router for navigation
    const router = useRouter();

    // Fetch user data when userId changes
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true); // Set loading state
                const res = await getUser(userId); // Fetch user data

                if (res?.success && res.data) {
                    const fetchedData = res.data as UserData;

                    // Convert Firestore timestamp to ISO string
                    const fetchedUser = {
                        ...fetchedData,
                        createdAt: fetchedData.createdAt
                            ? new Date(fetchedData.createdAt._seconds * 1000).toISOString()
                            : null,
                    };

                    // Set user state
                    setUser({
                        userId: fetchedUser.id,
                        name: fetchedUser.name,
                        email: fetchedUser.email,
                    });
                } else {
                    // Show error toast if user data fetch fails
                    toast.error(res?.message || "Failed to fetch user data");
                }
            } catch (error) {
                // Handle unexpected errors
                toast.error("Something went wrong, please try again");
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false); // Reset loading state
            }
        };

        if (userId) {
            fetchUserData(); // Fetch user data if userId is provided
        }
    }, [userId]);

    // Handle form submission to initiate payment
    const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true); // Set loading state

        // Validate user data
        if (!user?.userId || !user?.email || !user?.name) {
            toast.error("User data not available");
            setLoading(false);
            return;
        }

        try {
            // Create Razorpay order
            const orderId: string = await createOrderId(price, "INR");

            // Configure Razorpay checkout options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Razorpay public key
                amount: price * 100, // Convert to paise
                currency: "INR", // Currency code
                name: "NGO", // Organization name
                description: "A step towards to uplift the people", // Payment description
                order_id: orderId, // Razorpay order ID
                handler: async function (response: RazorpayResponse) {
                    try {
                        // Verify payment with backend
                        const paymentResponse = await axios.post("/api/verifyOrder", {
                            razorpay_order_id: orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // Show success toast
                        toast.success("Payment Successful!");

                        console.log(paymentResponse);
                        
                        // Redirect to payment success page
                        const paymentId = paymentResponse?.data?.data?.payment_id;
                        if (paymentId) {
                            router.push(`/payment-success/${paymentId}`);
                        }
                    } catch (error) {
                        // Handle verification failure
                        toast.error("Payment verification failed. Please contact support.");
                        console.error("Payment verification error:", error);
                    }
                },
                prefill: {
                    name: user.name, // Pre-fill user name
                    email: user.email, // Pre-fill user email
                },
                theme: {
                    color: "#3399cc", // Razorpay checkout theme color
                },
            };

            // Initialize and open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function (response: RazorpayResponse | RazorpayError) {
                // Handle payment failure
                if ("error" in response) {
                    toast.error(`Payment failed: ${response.error.description} `);
                    console.error("Payment failed:", response.error);
                } else {
                    toast.error("Payment failed: Unknown error");
                    console.error("Unexpected response:", response);
                }
            });
            razorpay.open(); // Open Razorpay checkout modal
        } catch (error) {
            // Handle payment initiation errors
            toast.error("Payment failed. Please try again.");
            console.error("Payment initiation error:", error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <>
            {/* Load Razorpay checkout script */}
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Donation form */}
            <form
                onSubmit={handlePayment}
                className="bg-white rounded-xl p-6 shadow-md w-full max-w-md space-y-4"
            >
                <h2 className="text-xl font-bold text-gray-800">Make a Donation</h2>

                {/* Donation amount input */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Amount (INR)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)} // Update price state
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={1} // Prevent non-positive values
                        required // Make input required
                    />
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={loading} // Disable during loading
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                    {loading ? "Processing..." : "Donate"} {/* Show loading state */}
                </Button>
            </form>
        </>
    );
};

export default DonationForm;
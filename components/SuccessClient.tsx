// app/(root)/(public)/donate/success/SuccessClient.tsx
"use client"

import { Loader, PartyPopper } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Payment {
    payment_id: string,
    amount: string,
    status: string,
    method: string,
    currency: string,
    email: string,
    contact: string,
    notes: string,
}

export default function SuccessClient() {
    const searchParams = useSearchParams()
    const [paymentData, setPaymentData] = useState<Payment | null>(null)
    const [loading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true);
        const data = searchParams.get("data")
        if (data) {
            try {
                const parsed = JSON.parse(decodeURIComponent(data))
                setPaymentData(parsed)
            } catch (err) {
                console.error("Failed to parse payment data", err)
            }
        }
        setIsLoading(false)
    }, [searchParams])

    if (!paymentData) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Data Not Found
            </div>
        )
    }

    if (loading) {
        <div className="flex items-center justify-center h-screen text-gray-500">
            <Loader size={18} className="animate-spin" /> Loading...
        </div>
    }

    return (
        <section>
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                        <PartyPopper size={20} className="text-warn" />
                        Payment Successful!
                    </h1>
                    <p className="text-gray-700 mb-6">Thank you for your support. Here are your payment details:</p>

                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 text-left">
                        <p className="font-semibold text-warn">Payment ID:</p>
                        <p>{paymentData.payment_id}</p>

                        <p className="font-semibold text-warn">Amount:</p>
                        <p>₹{paymentData.amount}</p>

                        <p className="font-semibold text-warn">Status:</p>
                        <p>{paymentData.status}</p>

                        <p className="font-semibold text-warn">Method:</p>
                        <p>{paymentData.method}</p>

                        <p className="font-semibold text-warn">Currency:</p>
                        <p>{paymentData.currency}</p>

                        <p className="font-semibold text-warn">Email:</p>
                        <p>{paymentData.email}</p>

                        <p className="font-semibold text-warn">Contact:</p>
                        <p>{paymentData.contact}</p>

                        {paymentData.notes && (
                            <>
                                <p className="font-semibold text-warn">Note:</p>
                                <p>{paymentData.notes}</p>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-sm text-gray-500">
                        You can take a screenshot of this page as confirmation and check your email
                    </p>
                </div>
            </div>
        </section>
    )
}

"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "../ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Loader } from "lucide-react"
import { Button } from "../ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Script from "next/script"
import axios from "axios"
import { createOrderId } from "@/utils/payment"

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

interface RazorpayError {
    error: {
        code: string
        description: string
        source: string
        step: string
        reason: string
        metadata: {
            order_id: string
            payment_id: string
        }
    }
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill: {
        name: string
        email: string
    }
    theme: {
        color: string
    }
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void
            on: (event: string, callback: (response: RazorpayResponse | RazorpayError) => void) => void
        }
    }
}

const formSchema = z.object({
    name: z.string().min(1, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    amount: z
        .number({ invalid_type_error: "Enter a valid amount" })
        .min(500, "Minimum donation is ₹500"),
    message: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const PublicDonateForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            amount: 500,
            message: "",
        },
    })

    const handlePayment = async (values: FormValues) => {
        setIsLoading(true)

        if (!values.name || !values.email || !values.amount) {
            toast.error("User data not available")
            setIsLoading(false)
            return
        }

        try {
            const orderId = await createOrderId(values.amount, "INR")

            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
            if (!razorpayKey) {
                toast.error("Payment setup failed. Please contact support.")
                console.error("Missing Razorpay Key")
                return
            }

            const options: RazorpayOptions = {
                key: razorpayKey,
                amount: values.amount * 100,
                currency: "INR",
                name: "NGO",
                description: "A step towards to uplift the people",
                order_id: orderId,
                handler: async function (response: RazorpayResponse) {
                    try {
                        const paymentResponse = await axios.post("/api/verifyPublicOrder", {
                            razorpay_order_id: orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            email: values.email,
                            name: values.name,
                        })

                        toast.success("Payment Successful!")
                        // Redirect to success page with encoded data
                        const paymentData = paymentResponse?.data?.data
                        const encodedData = encodeURIComponent(JSON.stringify(paymentData))
                        router.push(`/donate/success?data=${encodedData}`)
                    } catch (error) {
                        toast.error("Payment verification failed.")
                        console.error("Verification Error:", error)
                        setIsLoading(false)
                    }
                },
                prefill: {
                    name: values.name,
                    email: values.email,
                },
                theme: {
                    color: "#3399cc",
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.on("payment.failed", function (response: RazorpayResponse | RazorpayError) {
                if ("error" in response) {
                    toast.error(`Payment failed: ${response.error.description}`)
                    console.error("Payment failed:", response.error)
                } else {
                    toast.error("Payment failed: Unknown error")
                    console.error("Unexpected response:", response)
                }
                setIsLoading(false)
            })
            razorpay.open()
        } catch (error) {
            toast.error("Payment initiation failed.")
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full mt-5 shadow-xl border mx-auto rounded-2xl bg-white">
            <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold">Support Our Cause</h2>
                <p className="text-sm text-muted-foreground">
                    Make a donation to Hussaini Welfare Association
                </p>
            </CardHeader>

            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

            <CardContent className="p-6 space-y-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your full name" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                            disabled={isLoading}
                                            min={1}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write a message with your donation"
                                            {...field}
                                            disabled={isLoading}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Processing...
                                </>
                            ) : (
                                "Donate Now"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <p className="text-xs text-gray-400 text-center">
                Powered by Razorpay
            </p>
        </Card>
    )
}

export default PublicDonateForm

"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import FooterSection from "@/components/sections/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "@/firebase/firebase";


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset link sent! Check your email.");
        } catch (error: any) {
            console.error("Password reset error:", error);
            toast.error(error.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full bg-light font-sans">
            <div className="w-full min-h-[95vh] grid grid-cols-1 lg:grid-cols-2 items-center gap-5 max-w-7xl mx-auto px-6 md:px-8 py-10">
                <Image
                    alt="image"
                    src="/image1.png"
                    width={100}
                    unoptimized
                    height={100}
                    className="w-full object-contain hidden lg:block"
                />

                <div className="w-full flex flex-col justify-center items-center space-y-8">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 animate-fade-in">
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                            Forgot Password
                        </h1>

                        <form onSubmit={handleReset} className="space-y-5">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending reset link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Remember your password?{" "}
                                <Link
                                    href="/auth/signin"
                                    className="text-green-600 hover:underline font-medium"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
};

export default ForgotPasswordPage;

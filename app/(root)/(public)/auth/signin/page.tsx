"use client";

import { signIn } from "@/actions/auth";
import FooterSection from "@/components/sections/FooterSection";
import SignWithGoogle from "@/components/SignWithGoogle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUser } from "@/lib/features/users/userSlice";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn(email, password);

            if (!res?.success) {
                toast.error(res.message);
                return;
            }

            if (res.data) {
                const { id, name, email, user_type, token } = res.data;
                dispatch(setUser({ id, name, email, user_type: user_type || "REGULAR", token: token || "" }));
                toast.success("Signed in successfully!");
                router.push("/dashboard");
            } else {
                toast.error("User data is missing in response.");
            }
        } catch (error: unknown) {
            console.error("Signin error:", error);
            toast.error("Something went wrong. Please try again.");
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
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h1>
                        <form onSubmit={handleSubmit} className="space-y-5">
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
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="relative text-center text-sm text-gray-500">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <span className="bg-white px-2 relative z-10">or</span>
                            </div>

                            <SignWithGoogle />

                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/auth/signup" className="text-green-600 hover:underline font-medium">
                                    Sign Up
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div >
            <FooterSection />
        </section>
    );
};

export default Page;

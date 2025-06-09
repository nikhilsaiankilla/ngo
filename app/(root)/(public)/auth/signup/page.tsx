"use client";

// Import dependencies for authentication, UI components, routing, and notifications
import { signUp } from '@/actions/auth';
import SignWithGoogle from '@/components/SignWithGoogle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

// Define the SignUpPage component
const Page = () => {
    // Initialize state for name, email, password, and loading status
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize Next.js router
    const router = useRouter();

    // Handle form submission for sign-up
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Set loading state to true during sign-up attempt
        setLoading(true);

        try {
            // Call signUp action to create a new user with name, email, and password
            const res = await signUp(name, email, password);

            // Check if sign-up was unsuccessful and display error
            if (!res?.success) {
                toast.error(res?.message || "something went wrong");
                return
            }

            // Show success notification and log response
            toast.success("Successfully signed up!");
            console.log("Signup response:", res);
            // Redirect to sign-in page after successful sign-up
            router.push('/auth/signin')
        } catch (error: unknown) {
            // Handle and display errors during sign-up
            console.error("Signup error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            // Reset loading state
            setLoading(false);
        }
    };

    return (
        <div>
            <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                {/* Card header with sign-up title */}
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">sign up</h2>
                </CardHeader>

                {/* Form for user sign-up */}
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Name input field */}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                className="mt-1"
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email input field */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password input field */}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="mt-1"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                        {/* Submit button with loading state */}
                        <Button type="submit" className="w-full mt-2">
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" /> Signing up
                                </>
                            ) : (
                                "sign up"
                            )}
                        </Button>

                        {/* Divider for alternative sign-up options */}
                        <div className="flex items-center w-full gap-2 text-sm text-muted-foreground">
                            <div className="flex-1 h-px bg-gray-300" />
                            or
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Google Sign-In component */}
                        <SignWithGoogle />

                        {/* Link to sign-in page */}
                        <p>
                            if you already have account please{" "}
                            <Link href="/auth/signin" className="text-blue-400">
                                signin
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );

}

// Export the component
export default Page
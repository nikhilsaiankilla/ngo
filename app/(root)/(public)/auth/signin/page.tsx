'use client';

// Import dependencies for authentication, UI components, routing, state management, and notifications
import { signIn } from "@/actions/auth";
import SignWithGoogle from "@/components/SignWithGoogle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUser } from "@/lib/features/users/userSlice";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// Define the SignInPage component
const Page = () => {
    // Initialize state for email, password, and loading status
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize Next.js router and Redux dispatch
    const router = useRouter();
    const diapatch = useDispatch();

    // Handle form submission for email/password sign-in
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Set loading state to true during sign-in attempt
        setLoading(true);

        try {
            // Call signIn action to authenticate user with email and password
            const res = await signIn(email, password);

            // Check if sign-in was unsuccessful and display error
            if (!res?.success) {
                toast.error(res.message);
                return;
            }

            // Process user data if sign-in is successful
            if (res.data) {
                const { id, name, email, user_type, token } = res.data;

                // Dispatch user data to Redux store
                diapatch(setUser({
                    id,
                    name,
                    email,
                    user_type: user_type || "REGULAR",
                    token: token || ""
                }));

                // Show success notification
                toast.success('Signed in successfully!');
                // Redirect to home page
                router.push('/home');
            } else {
                // Handle missing user data in response
                toast.error("User data is missing in response.");
            }
        } catch (error: unknown) {
            // Handle and display errors during sign-in
            if (error instanceof Error) {
                toast.error(error?.message || 'Something went wrong. Please try again.');
            }
            console.error('Signin error:', error);
        } finally {
            // Reset loading state
            setLoading(false);
        }
    };

    return (
        // Container for centering the sign-in card
        <div>
            <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                {/* Card header with sign-in title */}
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">Sign In</h2>
                </CardHeader>

                {/* Form for email/password authentication */}
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Email input field */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        {/* Password input field */}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                        {/* Submit button with loading state */}
                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        {/* Divider for alternative sign-in options */}
                        <div className="flex items-center w-full gap-2 text-sm text-muted-foreground">
                            <div className="flex-1 h-px bg-gray-300" />
                            or
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Google Sign-In component */}
                        <SignWithGoogle />

                        {/* Link to sign-up page */}
                        <p>if you dont have account please <Link href='/auth/signup' className="text-blue-400">signup</Link></p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

// Export the component
export default Page
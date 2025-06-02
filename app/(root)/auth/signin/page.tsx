'use client';

import { signIn } from "@/actions/auth";
import SignWithGoogle from "@/components/SignWithGoogle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn(email, password);

            if (!res?.success) {
                toast.error(res.message);
                return;
            }

            toast.success('Signed in successfully!');
            router.push('/home')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error?.message || 'Something went wrong. Please try again.');
            }
            console.error('Signin error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">Sign In</h2>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
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

                        <div className="flex items-center w-full gap-2 text-sm text-muted-foreground">
                            <div className="flex-1 h-px bg-gray-300" />
                            or
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                       <SignWithGoogle/>

                        <p>if you dont have account please <Link href='/auth/signup' className="text-blue-400">signup</Link></p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Page
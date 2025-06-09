"use client";

import { signUp } from '@/actions/auth';
import SignWithGoogle from '@/components/SignWithGoogle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signUp(name, email, password);

            if (!res?.success) {
                toast.error(res?.message || 'Something went wrong');
                return;
            }

            toast.success('Successfully signed up!');
            router.push('/auth/signin');
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex justify-center items-center mt-14 px-4">
            <Card className="w-full max-w-md shadow-md border-none">
                <CardHeader className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                    <p className="text-sm text-muted-foreground">Join us today, it's quick and easy.</p>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className='mt-2'
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='mt-2'
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='mt-2'
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Signing up...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center w-full gap-2 text-xs text-muted-foreground">
                            <div className="flex-1 h-px bg-border" />
                            or
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <SignWithGoogle />

                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default SignUpPage;

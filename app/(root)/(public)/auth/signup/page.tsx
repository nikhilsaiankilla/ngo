"use client";

import { signUp, checkUsername } from '@/actions/auth';
import SignWithGoogle from '@/components/SignWithGoogle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils'; // Adjust import based on your utils location
import FooterSection from '@/components/sections/FooterSection';
import Image from 'next/image';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameStatus, setNameStatus] = useState<{ available: boolean; message: string } | null>(null);
    const router = useRouter();

    // Debounced function to check username availability
    const debouncedCheckUsername = useCallback(
        debounce(async (name: string) => {
            if (name.trim().length === 0) {
                setNameStatus(null);
                return;
            }

            const res = await checkUsername(name);
            if (res.success && res.data) {
                setNameStatus({ available: res.data.available, message: res.message });
            } else {
                setNameStatus({ available: false, message: res.message || 'Failed to check username' });
            }
        }, 500), // 500ms debounce delay
        []
    );

    // Check username availability when name changes
    useEffect(() => {
        debouncedCheckUsername(name);
    }, [name, debouncedCheckUsername]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameStatus?.available) {
            toast.error('Please choose a unique name');
            return;
        }

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
                                        className="mt-2"
                                    />
                                    {nameStatus && (
                                        <p
                                            className={`text-sm mt-1 ${nameStatus.available ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {nameStatus.message}
                                        </p>
                                    )}
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
                                        className="mt-2"
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
                                        className="mt-2"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || !nameStatus?.available}
                                >
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
            </div >
            <FooterSection />
        </section>
    );
};

export default SignUpPage;
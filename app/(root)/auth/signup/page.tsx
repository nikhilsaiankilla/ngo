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
import React, { useState } from 'react'
import { toast } from 'sonner';

const Page = () => {
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
                toast.error(res?.message || "something went wrong");
                return
            }

            toast.success("Successfully signed up!");
            console.log("Signup response:", res);
            router.push('/auth/signin')
        } catch (error: unknown) {
            console.error("Signup error:", error);
            toast.error("Something went wrong. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">sign up</h2>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                className='mt-1'
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                className='mt-1'
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className='mt-1'
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full mt-2">
                            {loading ? <><Loader className='animate-spin' /> Signing up</> : "sign up"}
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center w-full gap-2 text-sm text-muted-foreground">
                            <div className="flex-1 h-px bg-gray-300" />
                            or
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        <SignWithGoogle />

                        <p>if you already have account please <Link href='/auth/signin' className='text-blue-400'>signin</Link></p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Page
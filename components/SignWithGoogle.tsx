"use client";

import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { signInWithGoogleClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignWithGoogle = () => {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        const user = await signInWithGoogleClient();

        if (!user) {
            toast.error("Something went wrong while authenticating");
            return;
        }

        toast.success("Login successful!");
        router.push("/home");
    };

    return (
        <Button
            className="w-full px-1 rounded-lg cursor-pointer"
            onClick={handleGoogleLogin}
        >
            <Image src="/googleLogo.webp" alt="logo" width={20} height={20} />
            Sign In With Google
        </Button>
    );
};

export default SignWithGoogle;

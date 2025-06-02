"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { signInWithGoogleClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const SignWithGoogle = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const user = await signInWithGoogleClient();

        if (!user) {
            toast.error("Something went wrong while authenticating");
            setIsLoading(false);
            return;
        }

        toast.success("Login successful!");
        router.push("/home");
        setIsLoading(false);
    };

    return (
        <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-base font-semibold"
            aria-live="polite"
            aria-busy={isLoading}
        >
            {isLoading && <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />}
            <Image
                src="/googleLogo.webp"
                alt="Google Logo"
                width={20}
                height={20}
                className="inline-block"
            />
            {isLoading ? "Signing in with Google..." : "Sign In With Google"}
        </Button>
    );
};

export default SignWithGoogle;

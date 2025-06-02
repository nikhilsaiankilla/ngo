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
            className="w-full px-1 rounded-lg cursor-pointer"
            onClick={handleGoogleLogin}
        >
            {
                isLoading && <Loader2 className="animate-spin"/>
            }
            
            <Image src="/googleLogo.webp" alt="logo" width={20} height={20} />
            {
                isLoading ? <> Signing With Google</> : "Sign In With Google"
            }
        </Button>
    );
};

export default SignWithGoogle;

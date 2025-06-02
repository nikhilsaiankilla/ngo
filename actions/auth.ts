"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { saveUser, SaveUserProps } from "@/utils/firestoreHelpers";
import { getErrorMessage } from "@/utils/helpers";
import { ServerActionResponse } from "@/types";
import { z } from "zod";
import { cookies } from "next/headers";
import { auth } from "@/firebase/firebase";
import { adminDb } from "@/firebase/firebaseAdmin";

const signUpSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export async function signUp(
    name: string,
    email: string,
    password: string,
): Promise<ServerActionResponse<SaveUserProps>> {
    // Validate input
    const validation = signUpSchema.safeParse({ email, password, name });

    if (!validation.success) {
        const messages = Object.values(validation.error.flatten().fieldErrors)
            .flat()
            .filter(Boolean)
            .join('; ');

        return {
            success: false,
            status: 400,
            message: messages || 'Validation failed',
        };
    }

    try {
        // Create user with email & password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        // Prepare user data for Firestore save
        const userData: SaveUserProps = {
            id: user.uid,
            name,
            email: user.email || email,
            image: user.photoURL || '',
        };

        // Save user data in Firestore
        await saveUser(userData);

        return {
            success: true,
            status: 201,
            message: 'Sign-up successful and user saved',
            data: userData,
        };
    } catch (error: unknown) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export async function signIn(email: string, password: string): Promise<ServerActionResponse<SaveUserProps>> {
    const validation = signInSchema.safeParse({ email, password });

    if (!validation.success) {
        const messages = Object.values(validation.error.flatten().fieldErrors)
            .flat()
            .filter(Boolean)
            .join('; ');

        return {
            success: false,
            status: 400,
            message: messages || 'Validation failed',
        };
    }

    try {
        const cookieStore = await cookies();
        // Sign in the user
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Get the ID token
        const token = await result.user.getIdToken();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        };

        cookieStore.set("accessToken", token, cookieOptions);
        cookieStore.set("userId", result?.user?.uid, cookieOptions);

        return {
            success: true,
            status: 200,
            message: 'Sign-in successful and token stored',
        };
    } catch (error: unknown) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

export async function handleTokenForGoogleAuth(idToken: string, uid: string) {
    try {
        const cookieStore = await cookies();

        if (!idToken || !uid) {
            return {
                success: false,
                status: 400,
                message: 'Validation failed',
            };
        }

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        };

        cookieStore.set("accessToken", idToken, cookieOptions);
        cookieStore.set("userId", uid, cookieOptions);

        return {
            success: true,
            status: 200,
            message: 'Token stored successfully',
        };

    } catch (error: unknown) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

export async function getCurrentUser(id: string) {
    try {
        if (!id) {
            return {
                success: false,
                status: 400,
                message: 'Id is missing',
            };
        }

        const userDoc = await adminDb.collection('users').doc(id).get();

        if (!userDoc.exists) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        return {
            success: true,
            status: 200,
            message: "User fetched successfully",
            data: { id: userDoc.id, ...userDoc.data() },
        };
    } catch (error: unknown) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}
"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { saveUser, SaveUserProps } from "@/utils/firestoreHelpers";
import { getErrorMessage } from "@/utils/helpers";
import { ServerActionResponse } from "@/types";
import { z } from "zod";
import { cookies } from "next/headers";
import { auth, db } from "@/firebase/firebase";
import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
import { doc, getDoc } from "firebase/firestore";

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
        const idToken = await result.user.getIdToken();

        // Fetch additional user data from Firestore
        const userDocRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userDocRef);

        let userType = "REGULAR"; // default
        if (userSnap.exists()) {
            const data = userSnap.data();
            userType = data.user_type || "REGULAR";
        }

        // Create a session cookie (server-side)
        const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        };

        cookieStore.set("accessToken", sessionCookie, cookieOptions);
        cookieStore.set("userId", result.user.uid, cookieOptions);

        return {
            success: true,
            status: 200,
            message: 'Sign-in successful and session cookie stored',
            data: {
                id: result.user.uid,
                email: result.user.email || "",
                name: result.user.displayName || "",
                token: sessionCookie || "",
                user_type: userType,
            }
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

        const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
        const token = await adminAuth.createSessionCookie(idToken, { expiresIn })
        cookieStore.set("accessToken", token, cookieOptions);
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

export async function userSignOut() {
    try {
        const cookieStore = await cookies();

        cookieStore.delete('accessToken');
        cookieStore.delete('userId');

        return { success: true, status: 200, message: 'Signed out successfully' }
    } catch (error: unknown) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

export async function getUser(id: string) {
    try {
        if (!id) {
            return { success: false, status: 400, message: 'User ID is required' };
        }

        const docSnap = await adminDb.collection('users').doc(id).get();

        if (!docSnap.exists) {
            return { success: false, status: 404, message: 'User not found' };
        }

        const fetchedUser = docSnap.data();

        const user = {
            id: docSnap.id,
            ...fetchedUser,
            createdAt: fetchedUser?.createdAt?.toDate()?.toISOString() || null,
        };

        return {
            success: true,
            status: 200,
            message: 'User fetched successfully',
            data: user,
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

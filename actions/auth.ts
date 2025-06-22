"use server";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { saveUser, SaveUserProps } from "@/utils/firestoreHelpers";
import { getErrorMessage } from "@/utils/helpers";
import { ServerActionResponse } from "@/types";
import { cookies } from "next/headers";
import { auth, db } from "@/firebase/firebase";
import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
import { doc, getDoc } from "firebase/firestore";
import { getCookiesFromServer } from "@/lib/serverUtils";
import { signInSchema, signUpSchema } from "@/validations";
import { getRandomFourDigits } from "@/lib/utils";


/**
 * Checks the availability of a username in the database.
 * @param name - The username to check.
 * @returns A promise resolving to a ServerActionResponse containing availability status.
 */
export async function checkUsername(name: string): Promise<ServerActionResponse<{ available: boolean }>> {
    try {
        // Validate input: ensure name is provided and not empty
        if (!name || name.trim().length === 0) {
            return {
                success: false,
                status: 400,
                message: 'Name is required',
            };
        }

        // Reference to the users collection in the database
        const usersRef = adminDb.collection('users');
        // Query for documents where the name field matches the provided username
        const nameQuery = usersRef.where('name', '==', name.trim());
        // Execute the query
        const querySnapshot = await nameQuery.get();

        // Return response indicating whether the username is available
        return {
            success: true,
            status: 200,
            data: { available: querySnapshot.empty },
            message: querySnapshot.empty ? 'Name is available' : 'Name is already taken',
        };
    } catch (error: unknown) {
        // Handle any errors that occur during the database query
        return {
            success: false,
            status: 500,
            message: 'Failed to check username availability',
        };
    }
}


/**
 * Handles user sign-up, including validation, authentication, and saving user data.
 * @param name - The user's name.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise resolving to a ServerActionResponse containing the result of the sign-up process.
 */
export async function signUp(name: string, email: string, password: string): Promise<ServerActionResponse<SaveUserProps>> {
    // Validate input using the sign-up schema
    const validation = signUpSchema.safeParse({ email, password, name });

    // Handle validation errors
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
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare user data for storage
        const userData: SaveUserProps = {
            id: user.uid,
            name: name.trim(),
            email: user.email || email,
            image: user.photoURL || '',
        };

        // Save user data to the database
        await saveUser(userData);
        // Send email verification to the user
        await sendEmailVerification(user);

        // Return success response with user data
        return {
            success: true,
            status: 201,
            message: 'Sign-up successful and user saved',
            data: userData,
        };
    } catch (error: unknown) {
        // Handle any errors that occur during sign-up
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}


/**
 * Handles user sign-in, including validation, authentication, and session management.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise resolving to a ServerActionResponse containing the result of the sign-in process.
 */
export async function signIn(email: string, password: string): Promise<ServerActionResponse<SaveUserProps>> {
    // Validate input using the sign-in schema
    const validation = signInSchema.safeParse({ email, password });

    // Handle validation errors
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
        // Access the cookie store
        const cookieStore = await cookies();
        // Authenticate user with Firebase Authentication
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;

        // Check if user's email is verified
        if (user && !user.emailVerified) {
            await signOut(auth);
            return {
                success: false,
                status: 400,
                message: 'Please verify your email to sign in',
            };
        }

        // Retrieve ID token for session creation
        const idToken = await result.user.getIdToken();
        // Reference to user document in Firestore
        const userDocRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userDocRef);

        // Determine user type from Firestore data, default to "REGULAR"
        let userType = "REGULAR";
        if (userSnap.exists()) {
            const data = userSnap.data();
            userType = data.user_type || "REGULAR";
        }

        // Set session cookie expiration (7 days in milliseconds)
        const expiresIn = 7 * 24 * 60 * 60 * 1000;
        // Create session cookie using Firebase Admin SDK
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        // Define cookie options for security
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        };

        // Store session cookie and user ID in cookie store
        cookieStore.set("accessToken", sessionCookie, cookieOptions);
        cookieStore.set("userId", result.user.uid, cookieOptions);

        // Return success response with user data
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
            },
        };
    } catch (error: unknown) {
        // Handle any errors that occur during sign-in
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Handles token processing for Google Authentication, creating and storing a session cookie.
 * @param idToken - The ID token from Google Authentication.
 * @param uid - The user ID associated with the token.
 * @returns A promise resolving to a ServerActionResponse indicating the result of token processing.
 */
export async function handleTokenForGoogleAuth(idToken: string, uid: string) {
    try {
        // Access the cookie store
        const cookieStore = await cookies();

        // Validate input: ensure idToken and uid are provided
        if (!idToken || !uid) {
            return {
                success: false,
                status: 400,
                message: 'Validation failed',
            };
        }

        // Define cookie options for security
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        };

        // Set session cookie expiration (7 days in milliseconds)
        const expiresIn = 7 * 24 * 60 * 60 * 1000;
        // Create session cookie using Firebase Admin SDK
        const token = await adminAuth.createSessionCookie(idToken, { expiresIn });
        // Store session cookie and user ID in cookie store
        cookieStore.set("accessToken", token, cookieOptions);
        cookieStore.set("userId", uid, cookieOptions);

        // Return success response
        return {
            success: true,
            status: 200,
            message: 'Token stored successfully',
        };
    } catch (error: unknown) {
        // Handle any errors that occur during token processing
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Handles user sign-out by clearing session cookies.
 * @returns A promise resolving to a ServerActionResponse indicating the result of the sign-out process.
 */
export async function userSignOut() {
    try {
        // Access the cookie store
        const cookieStore = await cookies();
        // Remove session-related cookies
        cookieStore.delete('accessToken');
        cookieStore.delete('userId');

        // Return success response
        return { success: true, status: 200, message: 'Signed out successfully' };
    } catch (error: unknown) {
        // Handle any errors that occur during sign-out
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Retrieves user data from the database by user ID.
 * @param id - The ID of the user to fetch.
 * @returns A promise resolving to a ServerActionResponse containing the user data or an error message.
 */
export async function getUser(id: string) {
    try {
        // Validate input: ensure user ID is provided
        if (!id) {
            return { success: false, status: 400, message: 'User ID is required' };
        }

        // Fetch user document from Firestore
        const docSnap = await adminDb.collection('users').doc(id).get();
        // Check if user exists
        if (!docSnap.exists) {
            return { success: false, status: 404, message: 'User not found' };
        }

        // Extract user data from document
        const fetchedUser = docSnap.data();
        // Structure user data for response
        const user = {
            id: docSnap.id,
            name: fetchedUser?.name,
            email: fetchedUser?.email,
            photoURL: fetchedUser?.photoURL,
            user_type: fetchedUser?.user_type,
            phoneNumber: fetchedUser?.phoneNumber ?? null,
            isPhoneVerified: fetchedUser?.isPhoneVerified ?? false,
            createdAt: fetchedUser?.createdAt?.toDate().toISOString() || null,
        };

        // Return success response with user data
        return { success: true, status: 200, message: 'User fetched successfully', data: user };
    } catch (error: unknown) {
        // Handle any errors that occur during user retrieval
        return { success: false, status: 500, message: getErrorMessage(error) };
    }
}

/**
 * Retrieves the role of the authenticated user from the database.
 * @returns A promise resolving to a ServerActionResponse containing the user's role or an error message.
 */
export async function getUserRole() {
    try {
        // Retrieve user ID from server cookies
        const { userId } = await getCookiesFromServer();
        // Validate input: ensure user ID is provided
        if (!userId) {
            return { success: false, status: 400, message: 'User ID is required' };
        }

        // Fetch user document from Firestore
        const docSnap = await adminDb.collection('users').doc(userId).get();
        // Check if user exists
        if (!docSnap.exists) {
            return { success: false, status: 404, message: 'User not found' };
        }

        // Extract user data and determine user role, defaulting to "REGULAR"
        const fetchedUser = docSnap.data();
        const user_type = fetchedUser?.user_type || "REGULAR";

        // Return success response with user role
        return { success: true, status: 200, message: 'Fetched Role Successfully', data: user_type };
    } catch (error: unknown) {
        // Handle any errors that occur during role retrieval
        return { success: false, status: 500, message: getErrorMessage(error) };
    }
}

/**
 * Retrieves user data for UI display purposes from the database.
 * @returns A promise resolving to a ServerActionResponse containing the user's data or an error message.
 */
export async function getUserForUi() {
    try {
        // Retrieve user ID from server cookies
        const { userId } = await getCookiesFromServer();
        // Validate input: ensure user ID is provided
        if (!userId) {
            return { success: false, status: 400, message: 'User ID is required' };
        }

        // Fetch user document from Firestore
        const docSnap = await adminDb.collection('users').doc(userId).get();
        // Check if user exists
        if (!docSnap.exists) {
            return { success: false, status: 404, message: 'User not found' };
        }

        // Extract user data from document
        const fetchedUser = docSnap.data();
        // Structure user data for UI display
        const user = {
            id: docSnap.id,
            name: fetchedUser?.name,
            email: fetchedUser?.email,
            image: fetchedUser?.photoURL,
        };

        // Return success response with user data
        return { success: true, status: 200, message: 'User fetched successfully', data: user };
    } catch (error: unknown) {
        // Handle any errors that occur during user retrieval
        return { success: false, status: 500, message: getErrorMessage(error) };
    }
}

/**
 * Saves the user's phone number to their profile and marks it as verified.
 *
 * @param phoneNumber - The phone number to be saved.
 * @returns A structured response object indicating success or failure.
 */
export async function savePhoneNumber(phoneNumber: string) {
    try {
        // Retrieve cookies to get the current user's ID
        const { userId } = await getCookiesFromServer();

        // If user ID is not found in cookies, return unauthorized error
        if (!userId) {
            return {
                success: false,
                status: 400,
                message: 'Unauthorized access: user ID not found',
            };
        }

        // Validate input phone number
        if (!phoneNumber) {
            return {
                success: false,
                status: 500,
                message: 'Phone number is required',
            };
        }

        // Reference the user document in the Firestore database
        const userRef = adminDb.collection('users').doc(userId);

        // Fetch the user document
        const user = await userRef.get();

        // If user doesn't exist, return not found error
        if (!user.exists) {
            return {
                success: false,
                status: 404,
                message: 'User not found',
            };
        }

        // Update the user's phone number and mark as verified
        await userRef.update({
            phoneNumber,
            isPhoneVerified: true,
        });

        // Return success response
        return {
            success: true,
            status: 200,
            message: 'Phone number saved successfully',
        };
    } catch (error: unknown) {
        // Handle any unexpected errors gracefully
        return {
            success: false,
            status: 500,
            message: getErrorMessage(error),
        };
    }
}

/**
 * Generates a unique name by appending a 4-digit number to the base name.
 * Keeps generating until a unique name is found (not existing in the DB).
 *
 * @param name - Base name to make unique
 * @returns A unique name string
 */
export async function generateUniqueName(name: string): Promise<string> {
    let uniqueName = "";
    let exists = true;

    while (exists) {
        // Append random 4-digit number
        const suffix = getRandomFourDigits();
        uniqueName = `${name}${suffix}`;

        // Check if the name already exists in the database
        const snapshot = await adminDb.collection("users") // change collection if needed
            .where("username", "==", uniqueName)
            .get();

        exists = !snapshot.empty;
    }

    return uniqueName;
}

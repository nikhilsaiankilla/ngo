// lib/auth-client.ts

import { handleTokenForGoogleAuth } from "@/actions/auth";
import { db } from "@/firebase/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Interface representing the user data to be saved/used
export interface SaveUserProps {
  id: string;             // Unique user ID (Firebase UID)
  name: string;           // User's display name
  email: string;          // User's email address
  photoURL?: string;      // Optional profile image URL
}

// Function to handle Google Sign-In from the client
export async function signInWithGoogleClient(): Promise<SaveUserProps | null> {
  const provider = new GoogleAuthProvider();      // Initialize Google provider
  const auth = getAuth();                         // Firebase auth instance

  try {
    const result = await signInWithPopup(auth, provider);  // Trigger Google login popup
    const firebaseUser = result.user;                      // Authenticated Firebase user

    const userData: SaveUserProps = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || ""
    };

    const userRef = doc(db, "users", firebaseUser.uid);  // Reference to user doc in Firestore
    const existingUser = await getDoc(userRef);          // Check if user already exists

    if (!existingUser.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userRef, {
        ...userData,
        user_type: "REGULAR",                  // Assign default role
        createdAt: serverTimestamp(),          // Set creation timestamp
      });
    }

    // Retrieve ID token for the session
    const idToken = await firebaseUser.getIdToken();

    // Send token to server to store/verify session (already handled on server)
    await handleTokenForGoogleAuth(idToken, firebaseUser.uid);

    return userData;
  } catch (error: unknown) {
    console.error("Google Sign-In Error:", error);
    return null; // Return null on failure
  }
}

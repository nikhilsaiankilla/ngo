import { generateUniqueName, handleTokenForGoogleAuth } from "@/actions/auth";
import { db } from "@/firebase/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { store } from "./store";
import { setUser } from "./features/users/userSlice";
import { adminDb } from "@/firebase/firebaseAdmin";

// Interface for the user data we handle
export interface SaveUserProps {
  id: string;             // Firebase UID
  name: string;           // User's display name
  email: string;          // User's email
  photoURL?: string;      // Optional profile picture URL
}

// Function to handle Google sign-in and store user data
export async function signInWithGoogleClient(): Promise<SaveUserProps | null> {
  const provider = new GoogleAuthProvider();  // Create Google auth provider
  const auth = getAuth();                     // Initialize Firebase auth

  try {
    // Trigger Google sign-in popup
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Extract basic user info
    const userData: SaveUserProps = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
    };

    // Reference to the user's Firestore document
    const userRef = doc(db, "users", firebaseUser.uid);
    const existingUser = await getDoc(userRef);

    // Default user type
    let userType = "REGULAR";

    if (!existingUser.exists()) {
      // New user: ensure unique name and create Firestore entry
      userData.name = await generateUniqueName(firebaseUser.displayName || '');

      await setDoc(userRef, {
        ...userData,
        user_type: userType,
        createdAt: serverTimestamp(),
      });
      
    } else {
      // Existing user: fetch user_type from Firestore
      const userDocData = existingUser.data();
      userType = userDocData.user_type || "REGULAR";
    }

    // Get Firebase ID token for server auth/session
    const token = await firebaseUser.getIdToken();

    // Send token to server to handle session/auth setup
    await handleTokenForGoogleAuth(token, firebaseUser.uid);

    // Save user info in Redux store
    store.dispatch(setUser({
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      user_type: userType,
      token,
    }));

    return userData;
  } catch (error: unknown) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
}

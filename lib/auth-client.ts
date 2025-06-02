// lib/auth-client.ts

import { handleTokenForGoogleAuth } from "@/actions/auth";
import { db } from "@/firebase/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export interface SaveUserProps {
  id: string;
  name: string;
  email: string;
  photoURL?: string,
}

export async function signInWithGoogleClient(): Promise<SaveUserProps | null> {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userData: SaveUserProps = {
      id: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user?.photoURL || ""
    };

    const userRef = doc(db, "users", user.uid);
    const existingUser = await getDoc(userRef);

    if (!existingUser.exists()) {
      const user = await setDoc(userRef, {
        ...userData,
        "user_type": "REGULAR",
        createdAt: serverTimestamp(),
      });

    }

    const idToken = await user.getIdToken();

    // TODO : SERVER SIDE TOKEN IS ALREADY STORED WE NEED TO STORE THE TOKEN AFTER GOOGLE AUTH LOGIN
    await handleTokenForGoogleAuth(idToken, user.uid);

    return userData;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
}

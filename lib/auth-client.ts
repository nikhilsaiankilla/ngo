// lib/auth-client.ts

import { db } from "@/firebase/config";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { cookies } from "next/headers";

export interface SaveUserProps {
  id: string;
  name: string;
  email: string;
}

export async function signInWithGoogleClient(): Promise<SaveUserProps | null> {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const cookieStore = await cookies();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userData: SaveUserProps = {
      id: user.uid,
      name: user.displayName || "",
      email: user.email || "",
    };

    const userRef = doc(db, "users", user.uid);
    const existingUser = await getDoc(userRef);

    if (!existingUser.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    // TODO : SERVER SIDE TOKEN IS ALREADY STORED WE NEED TO STORE THE TOKEN AFTER GOOGLE AUTH LOGIN

    return userData;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
}

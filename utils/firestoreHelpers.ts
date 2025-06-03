// Firebase imports for Firestore functionality
import { db } from '@/firebase/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

// Interface to define the structure of user data to be saved
export interface SaveUserProps {
    id: string;           // Firebase Auth UID or any unique identifier
    name: string;         // Full name of the user
    image?: string;       // Optional profile image URL
    email: string;        // Email address of the user
    token?: string,
    user_type?: string,
}

// Function to save or update user data in Firestore
export const saveUser = async (user: SaveUserProps) => {
    // Reference to the user document in the 'users' collection
    const userRef = doc(db, 'users', user.id);

    // Set or merge user data into Firestore
    await setDoc(userRef, {
        name: user.name,                          // Store user name
        email: user.email,                        // Store user email
        photoURL: user.image || "",               // Use image if provided, else fallback to empty string
        user_type: "REGULAR",                     // Default role assigned to new users
        createdAt: serverTimestamp(),             // Firestore server timestamp for creation time
    }, { merge: true });                          // Merge data if document already exists
};

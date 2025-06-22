// Firebase imports for Firestore functionality
import { db } from '@/firebase/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * Interface defining the structure of user data to be saved to Firestore.
 */
export interface SaveUserProps {
    id: string;           // Unique identifier, typically Firebase Auth UID
    name: string;         // Full name of the user
    image?: string;       // Optional profile image URL
    email: string;        // User's email address
    token?: string;       // Optional auth token (not stored here)
    user_type?: string;   // Optional user role type
}

/**
 * Saves or updates a user's profile in the Firestore `users` collection.
 * 
 * @param user - The user object containing user details to be stored.
 */
export const saveUser = async (user: SaveUserProps): Promise<void> => {
    // Reference to the user document by their unique ID in the 'users' collection
    const userRef = doc(db, 'users', user.id);

    // Default user role fallback if not explicitly provided
    const role = user.user_type ?? "REGULAR";

    // Save the user data to Firestore with merge to avoid overwriting existing fields
    await setDoc(userRef, {
        name: user.name,
        email: user.email,
        photoURL: user.image ?? "",        // Fallback to empty string if image is undefined
        user_type: role,                   // Assign role
        createdAt: serverTimestamp(),      // Track when the document was created/updated
    }, { merge: true });
};

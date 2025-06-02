import { db } from '@/firebase/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export interface SaveUserProps {
    id: string,
    name: string,
    image?: string,
    email: string,
}

export const saveUser = async (user: SaveUserProps) => {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
        name: user.name,
        email: user.email,
        photoURL: user.image || "",
        user_type: "REGULAR",
        createdAt: serverTimestamp(),
    }, { merge: true });
};
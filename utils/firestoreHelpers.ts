import { db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

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
    }, { merge: true });
};
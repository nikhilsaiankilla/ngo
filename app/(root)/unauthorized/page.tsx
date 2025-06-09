'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

// Define User interface
interface UserData {
    id: string;
    name?: string;
    user_type?: 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';
}

export default function UnauthorizedPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data on auth state change
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUser({
                            id: firebaseUser.uid,
                            name: userDoc.data().name || firebaseUser.displayName || 'User',
                            user_type: userDoc.data().user_type || 'REGULAR',
                        });
                    } else {
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            user_type: 'REGULAR',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
                <Alert className="mb-6 border-gray-200 flex flex-col items-center justify-center gap-1">
                    <AlertCircleIcon className="h-10 w-10 text-green-700" />
                    <AlertTitle className="text-lg font-semibold text-green-700">
                        Unauthorized Access Denied
                    </AlertTitle>
                    <AlertDescription className="mt-2 text-gray-600">
                        {user
                            ? 'You don’t have the necessary permissions to access this page.'
                            : 'Please log in to access this page.'}
                    </AlertDescription>
                </Alert>

                <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {user ? (
                        <Link
                            href='/'
                            className="bg-green-600 text-white hover:bg-green-700"
                            aria-label="Go to homepage"
                        >
                            Go to Homepage
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/auth/signin"
                                className="bg-green-600 text-white hover:bg-green-700 px-2 py-1 rounded-lg"
                                aria-label="Go to login page"
                            >
                                Login
                            </Link>
                            <Link
                                href="/"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                aria-label="Go to homepage"
                            >
                                Home
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
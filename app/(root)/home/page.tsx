'use client';

import { auth } from '@/firebase/config';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface UserDetails {
    displayName: string,
    email: string,
    photoURL?: string,
}
const Page = () => {
    const [user, setUser] = useState<UserDetails>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            setUser({
                displayName: currentUser.displayName || "Guest",
                email: currentUser.email || "email",
                photoURL: currentUser.photoURL || "img",
            });
        } else {
            console.log('No user is currently logged in.');
        }

        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>No user is currently logged in.</div>;
    }

    return (
        <div>
            <h1>Current User</h1>
            <div><strong>Name:</strong> {user.displayName || 'N/A'}</div>
            <div><strong>Email:</strong> {user.email || 'N/A'}</div>
            <Image src={user?.photoURL || ""} alt={user.displayName} width={100} height={100}/>
        </div>
    );
};

export default Page;

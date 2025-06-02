import { LogoutButton } from '@/components/buttons/LogoutButton';
import { RequestRoleButton } from '@/components/buttons/RequestRoleButton';
import { adminDb } from '@/firebase/firebaseAdmin';
import { roleUpgradeMap } from '@/utils/helpers';
import Image from 'next/image';
import React from 'react';

type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

type User = {
    photoURL?: string;
    createdAt: { _seconds: number; _nanoseconds: number };
    user_type: UserRole;
    name: string;
    email: string;
    applied_roles?: string[];
};

const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const id = (await params).id;

    if (!id) {
        return <h1 className="text-red-500 text-center mt-10">No ID found</h1>;
    }

    const docSnap = await adminDb.collection('users').doc(id).get();

    if (!docSnap.exists) {
        return <h1 className="text-red-500 text-center mt-10">User not found</h1>;
    }

    const user = docSnap.data() as User;

    const requestedRole = roleUpgradeMap[user.user_type];

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-semibold mb-6 text-center">User Profile</h1>

            <div className="flex items-center space-x-6 mb-6">
                <Image
                    src={
                        user.photoURL || 'https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg'
                    }
                    alt={user.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-full object-cover border border-gray-300"
                />
                <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Joined on {formatDate(user.createdAt._seconds)}
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-1">User Role</h3>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {user.user_type}
                </span>
            </div>

            {user.applied_roles && user.applied_roles.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-1">Applied Roles</h3>
                    <div className="flex space-x-2">
                        {user.applied_roles.map((role) => (
                            <span
                                key={role}
                                className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col space-y-4">
                <LogoutButton />
                {requestedRole && requestedRole !== 'REGULAR' && (
                    <RequestRoleButton
                        currentRole={user.user_type}
                        requestedRole={requestedRole}
                    />
                )}
            </div>
        </div>
    );
};

export default Page;

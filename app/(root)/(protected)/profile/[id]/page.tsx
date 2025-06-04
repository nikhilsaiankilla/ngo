import { LogoutButton } from '@/components/buttons/LogoutButton';
import { RequestRoleButton } from '@/components/buttons/RequestRoleButton';
import Image from 'next/image';
import React from 'react';
import { getRoleRequestHistory } from '@/actions/requestRoleUpgrade'
import { getUser } from '@/actions/auth';
import { roleUpgradeMap } from '@/utils/helpers';
import { DataTable } from '../../(upper-trustie)/manage-members/data-table';
import { columns, RoleRequestHistory } from './columns';

type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

type User = {
    photoURL?: string;
    createdAt: { _seconds: number; _nanoseconds: number };
    user_type: UserRole;
    name: string;
    email: string;
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

    const [userRes, historyRes] = await Promise.all([getUser(id), getRoleRequestHistory(id)]);

    if (!userRes?.success) {
        return <h1 className="text-red-500 text-center mt-10">{userRes?.message}</h1>;
    }

    if (!historyRes?.success) {
        console.log("history message ", historyRes.message);
    }

    const historyData: RoleRequestHistory[] = historyRes?.data?.map((request: any) => ({
        userId: request.userId,
        name: request.name,
        message: request.message,
        currentRole: request.currentRole,
        requestedRole: request.requestedRole,
        status: request.status,
        reviewedBy: request.reviewedBy,
        rejectionReason: request.rejectionReason,

        // Convert reviewedAt from Firestore Timestamp object or string to ISO string
        reviewedAt: request.reviewedAt
            ? typeof request.reviewedAt === 'string'
                ? request.reviewedAt
                : request.reviewedAt.seconds // Firestore Timestamp has seconds and nanoseconds
                    ? new Date(request.reviewedAt.seconds * 1000).toISOString()
                    : undefined
            : undefined,
    })) ?? [];

    // Construct user with all needed props including createdAt
    const user: User = userRes?.data
        ? {
            name: userRes.data.name,
            photoURL: userRes.data.photoURL,
            email: userRes.data.email,
            user_type: userRes.data.user_type,
            createdAt: userRes.data.createdAt, // <- important!
        }
        : ({} as User);

    // requestedRole based on user_type
    const requestedRole = roleUpgradeMap[user.user_type];

    return (
        <div className="max-w-5xl mx-auto mt-10 ">
            <h1 className="text-3xl font-semibold mb-6 text-center">User Profile</h1>

            <div className='max-w-xl mx-auto shadow-md p-6 bg-white rounded-lg'>
                <div className="flex items-center space-x-6 mb-6">
                    <Image
                        src={
                            user.photoURL ||
                            'https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg'
                        }
                        alt={user.name || 'User'}
                        width={100}
                        height={100}
                        className="w-24 h-24 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                        <h2 className="text-xl font-bold">{user.name || 'No name'}</h2>
                        <p className="text-gray-600">{user.email || 'No email'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Joined on {user.createdAt ? formatDate(user.createdAt._seconds) : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-1">User Role</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user.user_type || 'Unknown'}
                    </span>
                </div>

                <div className="flex flex-col space-y-4">
                    <LogoutButton />
                    {requestedRole && requestedRole !== 'REGULAR' && (
                        <RequestRoleButton currentRole={user.user_type} requestedRole={requestedRole} />
                    )}
                </div>
            </div>

            <div className='mt-10'>
                {historyRes?.data && <DataTable columns={columns} data={historyData} />}
            </div>
        </div>
    );
};


export default Page;

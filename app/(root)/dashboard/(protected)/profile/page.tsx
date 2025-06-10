import { LogoutButton } from '@/components/buttons/LogoutButton';
import { RequestRoleButton } from '@/components/buttons/RequestRoleButton';
import Image from 'next/image';
import React from 'react';
import { getRoleRequestHistory } from '@/actions/requestRoleUpgrade';
import { getUser } from '@/actions/auth';
import { roleUpgradeMap } from '@/utils/helpers';
import { DataTable } from '../(upper-trustie)/manage-members/data-table';
import { columns, RoleRequestHistory } from './columns';
import { cookies } from 'next/headers';
import { PhoneVerification } from '@/components/PhoneVerification';

// Define types for user
type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

type User = {
    photoURL?: string;
    createdAt: { _seconds: number; _nanoseconds: number };
    user_type: UserRole;
    name: string;
    email: string;
    phoneNumber?: string;
    isPhoneVerified?: boolean;

};

// Define type for role request data from server
interface RoleRequest {
    userId: string;
    name: string;
    message: string;
    currentRole: string;
    requestedRole: string;
    status: 'accepted' | 'rejected';
    reviewedBy?: string;
    rejectionReason?: string;
    reviewedAt?: { seconds: number; nanoseconds: number } | string;
}

// Define type for historyRes
interface HistoryResponse {
    success: boolean;
    message?: string;
    data?: RoleRequest[];
}

// Define type for userRes
interface UserResponse {
    success: boolean;
    message?: string;
    data?: {
        name: string;
        photoURL?: string;
        email: string;
        user_type: UserRole;
        createdAt: { _seconds: number; _nanoseconds: number };
    };
}

const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const Page = async () => {
    const cookiesStore = await cookies();
    const id = cookiesStore.get('userId')?.value;

    if (!id) {
        return <h1 className="text-red-500 text-center mt-10">No ID found</h1>;
    }

    const [userRes, historyRes]: [UserResponse, HistoryResponse] = await Promise.all([
        getUser(id),
        getRoleRequestHistory(id),
    ]);

    if (!userRes?.success) {
        return <h1 className="text-red-500 text-center mt-10">{userRes?.message}</h1>;
    }
    if (!historyRes?.success) {
        console.log('History message:', historyRes?.message || 'No history data');
    }

    // Transform history data to match RoleRequestHistory
    const historyData: RoleRequestHistory[] = historyRes?.data?.map((request) => ({
        userId: request.userId || 'N/A',
        name: request.name || 'Unknown',
        message: request.message || '',
        currentRole: request.currentRole || 'Unknown',
        requestedRole: request.requestedRole || 'Unknown',
        status: request.status || 'pending',
        reviewedBy: request.reviewedBy || 'N/A',
        rejectionReason: request.rejectionReason || '',
        reviewedAt: request.reviewedAt
            ? typeof request.reviewedAt === 'string'
                ? request.reviewedAt
                : request.reviewedAt.seconds
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
            createdAt: userRes.data.createdAt,
        }
        : ({} as User);

    // Requested role based on user_type
    const requestedRole = roleUpgradeMap[user.user_type];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">User Profile</h1>

            <div className="grid grid-cols-1 gap-8">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className='w-full border-gray-100 bg-white rounded-2xl shadow-2xl p-4'>
                        <div className="flex items-center flex-col space-x-6 ">
                            <Image
                                src={
                                    user.photoURL ||
                                    "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png"
                                }
                                alt={user.name || 'User'}
                                width={100}
                                height={100}
                                className="w-32 h-32 rounded-full object-cover border border-gray-300"
                            />
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">{user.name || 'No name'}</h2>
                                <p className="text-gray-600">{user.email || 'No email'}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Joined on {user.createdAt ? formatDate(user.createdAt._seconds) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <h3 className="font-semibold text-gray-700 mb-1">User Role</h3>
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user.user_type || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    <div className='w-full border-gray-100 bg-white rounded-2xl shadow-2xl p-4'>
                        <PhoneVerification
                            defaultPhone={user.phoneNumber}
                            isVerified={user.isPhoneVerified}
                        />

                        <div className="mt-6 flex flex-col gap-4">
                            <LogoutButton />
                            {requestedRole && requestedRole !== 'REGULAR' && (
                                <RequestRoleButton currentRole={user.user_type} requestedRole={requestedRole} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section - History Table */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Role Request History</h2>
                    {historyData.length > 0 ? (
                        <DataTable columns={columns} data={historyData} />
                    ) : (
                        <p className="text-gray-500 text-center py-10">No role request history available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;

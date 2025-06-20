import { LogoutButton } from '@/components/buttons/LogoutButton';
import { RequestRoleButton } from '@/components/buttons/RequestRoleButton';
import React from 'react';
import { getRoleRequestHistory } from '@/actions/requestRoleUpgrade';
import { getUser } from '@/actions/auth';
import { roleUpgradeMap } from '@/utils/helpers';
import { DataTable } from '../(upper-trustie)/manage-members/data-table';
import { columns, RoleRequestHistory } from './columns';
import { cookies } from 'next/headers';
import { PhoneVerification } from '@/components/PhoneVerification';
import { Users, Verified } from 'lucide-react';
import ProfilePicture from '@/components/ProfilePicture';

type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

type User = {
    photoURL?: string;
    createdAt: string | null; // changed from timestamp object to ISO string
    user_type: UserRole;
    name: string;
    email: string;
    phoneNumber?: string | undefined;
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
    status: number,
    data?: RoleRequest[];
}

// Define type for userRes
interface UserResponse {
    success: boolean;
    message?: string;
    status: number,
    data?: {
        id: string,
        name: string,
        email: string,
        photoURL: string,
        user_type: UserRole,
        phoneNumber?: string,
        isPhoneVerified?: boolean,
        createdAt: string,
    };
}

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

    const user: User = {
        name: userRes?.data?.name || "",
        photoURL: userRes?.data?.photoURL,
        email: userRes?.data?.email || "",
        user_type: userRes?.data?.user_type || "REGULAR",
        createdAt: userRes?.data?.createdAt || "",
        phoneNumber: userRes?.data?.phoneNumber || "",
        isPhoneVerified: userRes?.data?.isPhoneVerified || false,
    }

    // Requested role based on user_type
    const requestedRole = roleUpgradeMap[user.user_type];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-bold text-left mb-10 text-gray-900 flex items-center gap-3"><Users size={25} className='text-warn'/> Your Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <ProfilePicture imageUrl={user?.photoURL} name={user?.name} />
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-800">{user.name || 'Unnamed User'}</h2>
                            <p className="text-gray-600">{user.email || 'No Email'}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Joined on {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm text-gray-500 mb-1">Current Role</h4>
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user.user_type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Phone + Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Phone Verification</h2>
                        {user?.isPhoneVerified ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                {user?.phoneNumber}
                                <Verified size={18} className="text-green-500" />
                                Verified
                            </div>
                        ) : (
                            <PhoneVerification defaultPhone={user?.phoneNumber} isVerified={user.isPhoneVerified} />
                        )}
                    </div>

                    <div className="mt-6 space-y-4">
                        <LogoutButton />
                        {requestedRole && requestedRole !== 'REGULAR' && (
                            <RequestRoleButton currentRole={user.user_type} requestedRole={requestedRole} />
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="mt-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Role Request History</h2>
                {historyData.length > 0 ? (
                    <DataTable columns={columns} data={historyData} />
                ) : (
                    <p className="text-gray-500 text-center py-10">No role request history available.</p>
                )}
            </div>
        </div>
    );
};

export default Page;

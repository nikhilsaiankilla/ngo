import { adminDb } from '@/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from '../../../(upper-trustie)/manage-members/data-table';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface Users {
    name: string;
    email: string;
    attended: string,
}

const ITEMS_PER_PAGE = 20;

const page = async ({ params, searchParams }: PageProps) => {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    const { id } = await params;

    const p = await searchParams;
    const cursor =
        typeof p.cursor === 'string' ? p.cursor : undefined;

    if (!userId) return redirect('/');

    const userSnap = await adminDb.collection('users').doc(userId).get();
    if (!userSnap.exists) return redirect('/');
    if (userSnap.data()?.user_type !== 'UPPER_TRUSTIE') return redirect('/dashboard');

    if (!id) {
        return <div className="text-red-500 text-center mt-10">Missing event ID</div>;
    }

    let users: Users[] = [];
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let errorMessage: string | null = null;

    try {
        let query = adminDb
            .collection('event_attendance')
            .where('eventId', '==', id)
            .limit(ITEMS_PER_PAGE + 1)
            .select('userName', 'userEmail', 'attended');

        if (cursor) {
            const cursorDoc = await adminDb.collection('event_participants').doc(cursor).get();
            if (cursorDoc.exists) query = query.startAfter(cursorDoc);
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;
        hasNextPage = docs.length > ITEMS_PER_PAGE;
        const paginatedDocs = hasNextPage ? docs.slice(0, -1) : docs;

        users = paginatedDocs.map((doc) => {
            const data = doc.data();
            return {
                name: data?.userName || "User",
                email: data?.userEmail || "email is missing",
                attended: data?.attended,
            };
        });

        nextCursor = hasNextPage ? docs[docs.length - 2]?.id : null;
    } catch (error) {
        console.error('Error fetching participants:', error);
        errorMessage = 'Error loading participants. Please try again later.';
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-6">
            <div className="w-full flex items-center justify-between flex-wrap">
                <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
                    Interested People to Contribute in Event
                </h1>
            </div>

            {errorMessage && (
                <div className="text-red-500 text-center mb-8">{errorMessage}</div>
            )}

            {!errorMessage && users.length === 0 && (
                <Card className="bg-gray-50 border border-gray-200">
                    <CardContent className="pt-10 pb-8 flex flex-col items-center">
                        <p className="text-gray-600 text-lg mb-6 text-center">No Users found.</p>
                    </CardContent>
                </Card>
            )}

            {!errorMessage && users.length > 0 && (
                <>
                    <DataTable columns={columns} data={users} />

                    <div className="flex justify-between mt-10">
                        {cursor && (
                            <Link href={`/dashboard/events/${id}/intrested-users`} passHref>
                                <Button
                                    variant="outline"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-100 transition flex items-center"
                                >
                                    <ArrowLeft size={20} /> Previous
                                </Button>
                            </Link>
                        )}

                        {hasNextPage && nextCursor && (
                            <Link
                                href={`/dashboard/events/${id}/intrested-users?cursor=${nextCursor}`}
                                passHref
                            >
                                <Button
                                    variant="outline"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-100 transition flex items-center"
                                >
                                    Next <ArrowRight size={20} />
                                </Button>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default page;

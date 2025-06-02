import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';

const Page = async ({ params }: { params: { id: string } }) => {
    const { id } = params;

    if (!id) {
        return <h1>No ID found</h1>;
    }

    const docSnap = await adminDb.collection('users').doc(id).get();

    if (!docSnap.exists) {
        return <h1>User not found</h1>;
    }

    const user = docSnap.data();

    return (
        <div>
            <h1>User Data</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
};

export default Page;

import EditServiceForm from '@/components/forms/EditServiceForm';
import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';


const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) {
        return <h1 className="text-red-500 text-center mt-10">No ID found</h1>;
    }

    let serviceData = null;

    try {
        const doc = await adminDb.collection('services').doc(id).get();

        if (!doc.exists) {
            return <h1 className="text-red-500 text-center mt-10">Event not found</h1>;
        }

        const data = doc.data();

        // Convert createdAt from Firestore Timestamp to string
        serviceData = {
            id,
            ...data,
            createdAt: data?.createdAt?.toDate().toISOString() || null,
            updatedAt: data?.updatedAt?.toDate().toISOString() || null,
        };

        console.log('Fetched Event:', serviceData);
    } catch (error) {
        console.error('Error fetching event:', error);
        return <h1 className="text-red-500 text-center mt-10">Error fetching event</h1>;
    }

    return (
        <div>
            <EditServiceForm serviceData={serviceData} />
        </div>
    );
};

export default page;
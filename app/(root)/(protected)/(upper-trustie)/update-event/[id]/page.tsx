import EventEditForm from '@/components/forms/EventEditForm';
import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) {
        return <h1 className="text-red-500 text-center mt-10">No ID found</h1>;
    }

    let eventData = null;

    try {
        const doc = await adminDb.collection('events').doc(id).get();

        if (!doc.exists) {
            return <h1 className="text-red-500 text-center mt-10">Event not found</h1>;
        }

        const data = doc.data();

        eventData = {
            id,
            ...data,
            endDate: data?.endDate?.toDate().toISOString() || null,
            startDate: data?.startDate?.toDate().toISOString() || null,
            createdAt: data?.createdAt?.toDate().toISOString() || null,
            updatedAt: data?.updatedAt?.toDate().toISOString() || null,
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        return <h1 className="text-red-500 text-center mt-10">Error fetching event</h1>;
    }

    return (
        <div>
            <EventEditForm eventData={eventData} />
        </div>
    );
};

export default page;

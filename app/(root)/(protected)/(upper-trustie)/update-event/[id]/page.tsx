import EventEditForm from '@/components/forms/EventEditForm';
import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';

interface PageProps {
    params: { id: string };
}

const page = async ({ params }: PageProps) => {
    const { id } = params;

    if (!id) {
        return <h1 className="text-red-500 text-center mt-10">No ID found</h1>;
    }

    let eventData = null;

    try {
        const doc = await adminDb.collection('events').doc(id).get();

        if (!doc.exists) {
            return <h1 className="text-red-500 text-center mt-10">Event not found</h1>;
        }

        eventData = doc.data();
        console.log('Fetched Event:', eventData);
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

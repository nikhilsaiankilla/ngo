import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';
import { notFound } from 'next/navigation';
import { markdownToHtml } from '@/utils/helpers';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) return notFound();

    const eventDoc = await adminDb.collection('events').doc(id).get();
    const event = eventDoc.data();

    if (!event) return <h1 className="text-xl text-center text-red-500 mt-10">No event found</h1>;

    // Convert Firestore Timestamps to ISO strings
    event.createdAt = event.createdAt?.toDate().toISOString() || null;
    event.updatedAt = event.updatedAt?.toDate().toISOString() || null;
    event.startDate = event.startDate?.toDate().toISOString() || null;
    event.endDate = event.endDate?.toDate().toISOString() || null;

    // Fetch creator's name
    let createdByName = 'Unknown';
    if (event.createdBy) {
        const userDoc = await adminDb.collection('users').doc(event.createdBy).get();
        const userData = userDoc.data();
        if (userData?.name) createdByName = userData.name;
    }

    const descriptionHTML = await markdownToHtml(event.description || '');

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Event Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-muted-foreground">{event.tagline}</p>
            </div>

            {/* Image */}
            {event.image && (
                <div className="w-full overflow-hidden rounded-xl shadow">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-auto max-h-[400px] object-cover"
                    />
                </div>
            )}

            {/* Meta Info */}
            <div className="text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-2">
                <p>
                    <span className="font-semibold">Created by:</span> {createdByName}
                </p>
                <p>
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()} -{' '}
                    {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p>
                    <span className="font-semibold">Location:</span> {event.location}
                </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-xs mx-auto">
                <article dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
            </div>
        </div>
    );
};

export default Page;

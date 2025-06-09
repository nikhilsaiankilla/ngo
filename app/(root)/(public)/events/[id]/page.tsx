import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';
import { notFound } from 'next/navigation';
import { markdownToHtml } from '@/utils/helpers';
import Image from 'next/image';

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
        <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Title + Tagline */}
            <header className="text-center space-y-3">
                <h1 className="text-4xl font-bold tracking-tight leading-tight text-gray-900">
                    {event.title}
                </h1>
                {event.tagline && (
                    <p className="text-gray-500 text-base sm:text-lg">{event.tagline}</p>
                )}
            </header>

            {/* Image */}
            {event.image && (
                <div className="rounded-2xl overflow-hidden shadow-sm border bg-gray-50 hover:shadow-md transition-shadow">
                    <Image
                        src={event.image}
                        alt={event.title}
                        width={1200}
                        height={630}
                        className="w-full h-auto aspect-video object-cover"
                        priority
                    />
                </div>
            )}

            {/* Meta Info */}
            <section className="text-sm text-gray-500 grid sm:grid-cols-3 gap-6 border-y py-6">
                <p>
                    <span className="text-gray-700 font-medium">Created by:</span> {createdByName}
                </p>
                <p>
                    <span className="text-gray-700 font-medium">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()} –{' '}
                    {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p>
                    <span className="text-gray-700 font-medium">Location:</span>{' '}
                    {event.location || 'N/A'}
                </p>
            </section>

            {/* Description */}
            <section
                className="prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:scroll-mt-20
                    prose-headings:mt-6 prose-headings:mb-3
                    prose-p:leading-relaxed prose-p:my-4 prose-p:text-gray-700
                    prose-a:text-blue-600 hover:prose-a:text-blue-700
                    prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:border-gray-300
                    prose-img:rounded-lg prose-img:shadow-sm
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-pink-600"
            >
                <article dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
            </section>

        </div>
    );
};

export default Page;

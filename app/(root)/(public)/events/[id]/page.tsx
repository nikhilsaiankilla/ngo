import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';
import { notFound } from 'next/navigation';
import { markdownToHtml } from '@/utils/helpers';
import SafeImage from '@/components/SafeImage';
import FooterSection from '@/components/sections/FooterSection';
import { Metadata } from 'next';
import { markdownToHtmlText } from '@/lib/utils';


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    const data = await getEventById(id);
    if (!data) return { title: 'Not Found', description: 'No event found' };

    const desc = (await markdownToHtmlText(data.event.description)).slice(0, 150);

    return {
        title: data.event.title,
        description: desc + '...',
        openGraph: {
            images: [{ url: data.event.image }]
        }
    };
}

export const getEventById = async (id: string) => {
    try {
        const eventDoc = await adminDb.collection('events').doc(id).get();
        const event = eventDoc.data();

        if (!event) return null;

        // Convert timestamps
        event.createdAt = event.createdAt?.toDate().toISOString() || null;
        event.updatedAt = event.updatedAt?.toDate().toISOString() || null;
        event.startDate = event.startDate?.toDate().toISOString() || null;
        event.endDate = event.endDate?.toDate().toISOString() || null;

        // Fetch creator name
        let createdByName = 'Unknown';
        if (event.createdBy) {
            const userDoc = await adminDb.collection('users').doc(event.createdBy).get();
            const userData = userDoc.data();
            if (userData?.name) createdByName = userData.name;
        }

        const descriptionHTML = await markdownToHtml(event.description || '');

        return { event, createdByName, descriptionHTML };
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
};


const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const data = await getEventById(id);
    if (!data) return notFound();

    const { event, createdByName, descriptionHTML } = data;

    return (
        <section className='w-full'>
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Title + Tagline */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight leading-tight text-gray-900">
                        {event.title}
                    </h1>
                    {event.tagline && (
                        <p className="text-gray-500 text-base sm:text-lg">{event.tagline}</p>
                    )}
                </div>

                {/* Image */}
                {event.image && (
                    <div className="rounded-2xl overflow-hidden shadow-sm border bg-gray-50 hover:shadow-md transition-shadow">
                        <SafeImage
                            src={event.image}
                            alt={`${event.title} Image`}
                            width={1200}
                            height={630}
                            className="w-full h-auto aspect-video object-cover"
                        />
                    </div>
                )}

                {/* Meta Info */}
                <div className="text-sm text-gray-500 grid sm:grid-cols-3 gap-6 border-y py-6">
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
                </div>

                {/* Description */}
                <div
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
                </div>

            </div>

            <FooterSection />
        </section>
    );
};

export default Page;

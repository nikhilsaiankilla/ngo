import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';
import { markdownToHtml } from '@/utils/helpers';
import SafeImage from '@/components/SafeImage';
import { cookies } from 'next/headers';
import DeleteBtn from '@/components/buttons/DeleteBtn';
import Link from 'next/link';
import { ArrowRight, PencilIcon } from 'lucide-react';
import ParticipateButton from '@/components/buttons/ParticipateButton';


const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) return <h1 className="text-xl text-center text-red-500 mt-10">Event Id is Missing</h1>

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

    const cookiesStore = await cookies();
    const userId = cookiesStore.get('userId')?.value;

    if (!userId) {
        return <h1 className='text-center text-red-500 mt-10'>user Id is missing</h1>
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const todayDate = new Date(); // Current date: June 12, 2025, 2:22 PM IST

    // Convert startDate (string or null) to Date or null
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const isTwoDaysOrMore = startDate && !isNaN(startDate.getTime())
        ? (startDate.getTime() - todayDate.getTime()) >= 2 * 24 * 60 * 60 * 1000
        : false;

    const isBeforeStart = startDate && new Date() < startDate;

    const endDate = event.endDate ? new Date(event.startDate) : null;
    const isAfterEnd = endDate && new Date() > endDate;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
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
            <section className="text-sm text-gray-500 grid sm:grid-cols-4 gap-6 border-y p-6 items-center">
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
                <>
                    {isTwoDaysOrMore && userId && userId !== event?.createdBy && event?.startDate && (
                        <ParticipateButton event={{ id }} />
                    )}

                    {isTwoDaysOrMore && userId && userId === event?.createdBy && (
                        <p className="grid grid-cols-2 items-center justify-end">
                            <DeleteBtn type="event" id={id} />
                            <Link
                                href={`/dashboard/update-event/${id}`}
                                className="flex items-center text-yellow-500 cursor-pointer gap-1"
                            >
                                <PencilIcon size={18} />
                                Update
                            </Link>
                        </p>
                    )}
                </>
            </section>

            {
                userData?.user_type === 'UPPER_TRUSTIE' && isBeforeStart && <span className='w-full flex justify-end'><Link
                    href={`/dashboard/events/${id}/intrested-users`}
                    className="flex items-center gap-1 text-sm font-medium text-warn hover:underline -mt-10"
                >
                    view Intrested People
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                </Link></span>
            }

            {
                userData?.user_type === 'UPPER_TRUSTIE' && isAfterEnd && <span className='w-full flex justify-end'><Link
                    href={`/dashboard/events/${id}/attended-members`}
                    className="flex items-center gap-1 text-sm font-medium text-warn hover:underline -mt-10"
                >
                    view attended people
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                </Link></span>
            }

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
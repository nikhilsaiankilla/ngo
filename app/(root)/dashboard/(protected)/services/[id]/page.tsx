import { adminDb } from '@/firebase/firebaseAdmin';
import React from 'react';
import { unauthorized } from 'next/navigation';
import { markdownToHtml } from '@/utils/helpers';
import SafeImage from '@/components/SafeImage';
import DeleteBtn from '@/components/buttons/DeleteBtn';
import Link from 'next/link';
import { PencilIcon } from 'lucide-react';
import { cookies } from 'next/headers';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) return unauthorized();

    const serviceDoc = await adminDb.collection('services').doc(id).get();
    const service = serviceDoc.data();

    if (!service) return <h1 className="text-xl text-center text-red-500 mt-10">No service found</h1>;

    // Convert Firestore Timestamps to ISO strings
    service.createdAt = service.createdAt?.toDate().toISOString() || null;
    service.updatedAt = service.updatedAt?.toDate().toISOString() || null;

    // Fetch creator's name
    let createdByName = 'Unknown';
    if (service.createdBy) {
        const userDoc = await adminDb.collection('users').doc(service.createdBy).get();
        const userData = userDoc.data();
        if (userData?.name) createdByName = userData.name;
    }

    const descriptionHTML = await markdownToHtml(service.description || '');

    const cookiesStore = await cookies();
    const userId = cookiesStore.get('userId')?.value;

    return (
        <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Event Header */}
            <header className="text-center space-y-3">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {service.title}
                </h1>

                {service.tagline && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">{service.tagline}</p>
                )}
            </header>

            {/* Image */}
            {service.image && (
                <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <SafeImage
                        src={service.image}
                        alt={`${service.title} Image`}
                        width={1200}
                        height={630}
                        className="w-full h-auto aspect-video object-cover"
                    />
                </div>
            )}

            {/* Meta Info */}
            <section className="grid sm:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Created By</p>
                    <p>{createdByName}</p>
                </div>
                {
                    userId && userId === service?.createdBy && <p className='grid grid-cols-2'>
                        <DeleteBtn type="service" id={id} />

                        <Link href={`/dashboard/update-service/${id}`} className='flex items-center text-yellow-500 cursor-pointer gap-1'>
                            <PencilIcon size={18} />
                            Update
                        </Link>
                    </p>
                }
            </section>

            {/* Description */}
            <section
                className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:scroll-mt-20
              prose-headings:mt-6 prose-headings:mb-3
              prose-p:leading-relaxed prose-p:my-4 prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-a:text-blue-600 hover:prose-a:text-blue-700
              prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:border-gray-300
              prose-img:rounded-lg prose-img:shadow
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600"
            >
                <article dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
            </section>
        </div>
    );
};

export default Page;

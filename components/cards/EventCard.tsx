import React from 'react';
import SafeImage from '../SafeImage';
import { Timestamp } from 'firebase-admin/firestore';
import { markdownToHtmlText } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Event = {
    id: string;
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string;
    startDate: Timestamp;
    endDate: Timestamp;
};

type EventCardProps = {
    event: Event;
    isDashboard?: boolean; // optional, defaults to false
};

const EventCard: React.FC<EventCardProps> = async ({ event, isDashboard = false }) => {
    const desc = await markdownToHtmlText(event.description);

    const formatDate = (timestamp: Timestamp) =>
        timestamp.toDate().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const eventLink = isDashboard ? `/dashboard/events/${event.id}` : `/events/${event.id}`;

    return (
        <div className="bg-white rounded-tr-3xl rounded-b-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
            <SafeImage
                src={event.image}
                alt={`${event.title} Image`}
                width={500}
                height={280}
                className="w-full h-60 object-cover rounded-bl-3xl"
            />

            <div className="flex flex-col justify-between p-5 space-y-4">
                {/* Date + Location */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className='text-center'>
                        <span className='mb-3'>Start Date</span>
                        <div className="bg-muted px-2 py-1 rounded-full text-[11px] font-medium">
                            {formatDate(event.startDate)}
                        </div>
                    </div>
                    <div className="text-center font-semibold text-sm text-gray-700 truncate max-w-[120px]">
                        {event.location}
                    </div>
                    <div className='text-center'>
                        <span className='mb-3'>End Date</span>
                        <div className="bg-muted px-2 py-1 rounded-full text-[11px] font-medium">
                            {formatDate(event.endDate)}
                        </div>
                    </div>
                </div>

                {/* Title & Description */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-warn transition-colors duration-200">
                        {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{desc}</p>
                </div>

                {/* CTA */}
                <div className="flex justify-end">
                    <Link
                        href={eventLink}
                        className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
                    >
                        View Details
                        <ArrowRight className="h-4 w-4 -rotate-45" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventCard;

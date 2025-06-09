import SafeImage from "@/components/SafeImage";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const revalidate = 60; // ISR every 60 seconds

type Event = {
    id: string;
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string;
    startDate: Date;
    endDate: Date;
};

const page = async () => {
    try {
        const now = Timestamp.now();

        // Fetch ongoing events
        const ongoingSnapshot = await adminDb
            .collection("events")
            .where("startDate", "<=", now)
            .orderBy("startDate", "asc")
            .limit(20)
            .get();

        const ongoingEvents: Event[] = ongoingSnapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    tagline: data.tagline,
                    location: data.location,
                    description: data.description,
                    image: data.image,
                    startDate: data.startDate.toDate(),
                    endDate: data.endDate.toDate(),
                };
            })
            .filter((event) => event.endDate >= new Date())
            .slice(0, 10);

        // Fetch upcoming events
        const upcomingSnapshot = await adminDb
            .collection("events")
            .where("startDate", ">", now)
            .orderBy("startDate", "asc")
            .limit(10)
            .get();

        const upcomingEvents: Event[] = upcomingSnapshot.docs.map((doc) => {
            const data = doc.data() as {
                title: string;
                tagline: string;
                location: string;
                description: string;
                image: string;
                startDate: FirebaseFirestore.Timestamp;
                endDate: FirebaseFirestore.Timestamp;
            };

            return {
                id: doc.id,
                title: data.title,
                tagline: data.tagline,
                location: data.location,
                description: data.description,
                image: data.image,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
            };
        });

        // Fetch past events
        const pastSnapshot = await adminDb
            .collection("events")
            .where("endDate", "<", now)
            .orderBy("endDate", "desc")
            .limit(10)
            .get();

        const pastEvents: Event[] = pastSnapshot.docs.map((doc) => {
            const data = doc.data() as {
                title: string;
                tagline: string;
                location: string;
                description: string;
                image: string;
                startDate: FirebaseFirestore.Timestamp;
                endDate: FirebaseFirestore.Timestamp;
            };

            return {
                id: doc.id,
                title: data.title,
                tagline: data.tagline,
                location: data.location,
                description: data.description,
                image: data.image,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
            };
        });

        const renderEventCard = (event: Event) => (
            <Card key={event.id} className="rounded-2xl shadow-md overflow-hidden transition hover:shadow-xl p-4">
                <SafeImage
                    src={event.image}
                    alt={`${event.title} Image`}
                    width={500}
                    height={280}
                    className="w-full aspect-video object-cover rounded-lg"
                />
                <CardContent className="space-y-1 p-4">
                    <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </CardDescription>
                    <span className="text-xs text-gray-500">
                        {event.startDate.toLocaleString()} → {event.endDate.toLocaleString()}
                    </span>
                </CardContent>
                <CardAction>
                    <Link href={`/dashboard/service/${event?.id}`}>View Details</Link>
                </CardAction>
            </Card>
        );

        return (
            <div className="p-6 space-y-12 max-w-7xl mx-auto">
                {/* Ongoing Events */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Ongoing Events</h2>
                    {ongoingEvents.length === 0 ? (
                        <p className="text-gray-500">No ongoing events at the moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {ongoingEvents.map(renderEventCard)}
                        </div>
                    )}
                </section>

                {/* Upcoming Events */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
                    {upcomingEvents.length === 0 ? (
                        <p className="text-gray-500">No upcoming events.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.map(renderEventCard)}
                        </div>
                    )}
                </section>

                {/* Past Events */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Past Events</h2>
                    {pastEvents.length === 0 ? (
                        <p className="text-gray-500">No past events.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pastEvents.map(renderEventCard)}
                        </div>
                    )}
                </section>
            </div>
        );
    } catch (error) {
        console.error("Error fetching events:", error);
        return <h1 className="text-red-600 text-center mt-10">Error fetching events</h1>;
    }
};

export default page;

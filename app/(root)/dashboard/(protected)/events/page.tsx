import CustomBtn from "@/components/buttons/CustomBtn";
import EventCard from "@/components/cards/EventCard";
import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { Calendar, Heart } from "lucide-react";
import Image from "next/image";

export const revalidate = 60;

export type Event = {
    id: string;
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string;
    startDate: Timestamp;
    endDate: Timestamp;
};

const page = async () => {
    const now = Timestamp.now();

    let ongoingEvents: Event[] = [];
    let upcomingEvents: Event[] = [];
    let pastEvents: Event[] = [];

    let hasError = false;

    try {
        const [ongoingSnapshot, upcomingSnapshot, pastSnapshot] = await Promise.all([
            adminDb
                .collection("events")
                .where("startDate", "<=", now)
                .orderBy("startDate", "asc")
                .limit(20)
                .get(),

            adminDb
                .collection("events")
                .where("startDate", ">", now)
                .orderBy("startDate", "asc")
                .limit(10)
                .get(),

            adminDb
                .collection("events")
                .where("endDate", "<", now)
                .orderBy("endDate", "desc")
                .limit(10)
                .get(),
        ]);

        ongoingEvents = ongoingSnapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    tagline: data.tagline,
                    location: data.location,
                    description: data.description,
                    image: data.image,
                    startDate: data.startDate,
                    endDate: data.endDate,
                };
            })
            .filter((event) => event.endDate >= new Date())
            .slice(0, 10);

        upcomingEvents = upcomingSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                tagline: data.tagline,
                location: data.location,
                description: data.description,
                image: data.image,
                startDate: data.startDate,
                endDate: data.endDate,
            };
        });

        pastEvents = pastSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                tagline: data.tagline,
                location: data.location,
                description: data.description,
                image: data.image,
                startDate: data.startDate,
                endDate: data.endDate,
            };
        });

    } catch (error) {
        console.error("Error fetching events:", error);
        hasError = true;
    }

    const renderEventSection = (title: string, events: Event[], error = false) => (
        <section className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
            {error ? (
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    Something went wrong while loading {title.toLowerCase()}.
                </p>
            ) : events.length === 0 ? (
                <p className="text-gray-500 text-center">No {title.toLowerCase()}.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} isDashboard={true} />
                    ))}
                </div>
            )}
        </section>
    );

    return (
        <div className="min-h-screen bg-gray-50 w-full max-w-7xl mx-auto">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 md:px-8 py-10">
                {/* Images Section */}
                <div className="w-full">
                    <div className="w-full">
                        <Image
                            src="https://pehchaanstreetschool.org/wp-content/uploads/2021/03/IMG_20201108_155431_Bokeh-scaled.jpg"
                            alt="Event Preview 1"
                            width={100}
                            height={100}
                            className="object-cover w-full h-full aspect-video rounded-tr-3xl rounded-bl-3xl"
                            unoptimized
                        />
                    </div>
                </div>

                {/* Text + Buttons Section */}
                <div className="flex flex-col justify-center lg:ml-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar size={32} className="text-warn" />
                        <h3 className="text-lg font-semibold uppercase tracking-wide text-warn">
                            Join the Movement
                        </h3>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
                        Discover. Participate. Make a Difference.
                    </h2>
                    <p className="text-base text-gray-600">
                        Browse through ongoing, upcoming, and past events organized by our team. Whether you want to contribute, volunteer, or simply attend — there’s something for everyone.
                    </p>
                    <p className="text-sm italic text-gray-500">
                        Every small step counts. Be the reason for someone's smile.
                    </p>
                    <div className="flex gap-4">
                        <CustomBtn
                            label="Donate"
                            href="/dashboard/donate"
                            icon={<Heart />}
                            variant="warn"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                {renderEventSection("Ongoing Events", ongoingEvents, hasError)}
                {renderEventSection("Upcoming Events", upcomingEvents, hasError)}
                {renderEventSection("Past Events", pastEvents, hasError)}
            </div>
        </div>
    );
};

export default page;

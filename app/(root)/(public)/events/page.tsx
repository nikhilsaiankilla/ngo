import CustomBtn from "@/components/buttons/CustomBtn";
import EventCard from "@/components/cards/EventCard";
import FooterSection from "@/components/sections/FooterSection";
import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { Calendar, CalendarRange } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

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

const page = async () => {
  let ongoingEvents: Event[] = [];
  let upcomingEvents: Event[] = [];
  let pastEvents: Event[] = [];
  let hasError = false;

  try {
    const now = Timestamp.now();

    const ongoingSnapshot = await adminDb
      .collection("events")
      .where("startDate", "<=", now)
      .orderBy("startDate", "asc")
      .limit(20)
      .get();

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

    const upcomingSnapshot = await adminDb
      .collection("events")
      .where("startDate", ">", now)
      .orderBy("startDate", "asc")
      .limit(10)
      .get();

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

    const pastSnapshot = await adminDb
      .collection("events")
      .where("endDate", "<", now)
      .orderBy("endDate", "desc")
      .limit(10)
      .get();

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

  const renderEventCard = (event: Event) => <EventCard event={event} key={event?.id} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Events Page */}
      <div
        className="relative w-full py-20 bg-cover bg-center px-6 sm:px-8"
        style={{ backgroundImage: "url('/donation.jpeg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand opacity-50 z-0" />

        {/* Content Wrapper */}
        <div className="relative z-10 h-full flex items-start justify-center">
          <div className="max-w-2xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar size={32} className="text-white" />
              <h3 className="text-xl font-bold uppercase tracking-wide">
                Join the Movement
              </h3>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-warn">
              Participate. Volunteer. Create Impact.
            </h2>
            <p className="mt-4 text-sm md:text-base">
              Explore upcoming and ongoing events organized by Hussaini Welfare Association. Every event is an opportunity to give back, connect, and drive real change in our communities.
            </p>
            <p className="mt-2 text-xs md:text-sm italic text-gray-100">
              Because showing up is the first step to transforming lives.
            </p>

            <div className="mt-6">
              <CustomBtn
                label="See Events"
                href="#events"
                icon={<CalendarRange />}
                variant="warn"
              />
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {hasError ? (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Fetching Events</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong while loading events. Please try again later.
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white font-medium py-2 px-6 rounded-full hover:bg-green-700 transition-all duration-200"
            >
              Go Back Home
            </Link>
          </div>
        ) : (
          <>
            {/* Ongoing Events */}
            <section className="animate-fade-in">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Ongoing Events</h2>
              {ongoingEvents.length === 0 ? (
                <p className="text-gray-500 text-center">No ongoing events at the moment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ongoingEvents.map(renderEventCard)}
                </div>
              )}
            </section>

            {/* Upcoming Events */}
            <section className="animate-fade-in">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center">No upcoming events.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map(renderEventCard)}
                </div>
              )}
            </section>

            {/* Past Events */}
            <section className="animate-fade-in">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Past Events</h2>
              {pastEvents.length === 0 ? (
                <p className="text-gray-500 text-center">No past events.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastEvents.map(renderEventCard)}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <FooterSection />
    </div>
  );
};

export default page;

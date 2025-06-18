import { adminDb } from "@/firebase/firebaseAdmin";
import EventCard from "../cards/EventCard";
import { Timestamp } from "firebase-admin/firestore";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 86400;

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

const EventsSection = async () => {
  const today = new Date();

  // Step 1: Fetch up to 3 future events
  const upcomingSnapshot = await adminDb
    .collection("events")
    .where("startDate", ">=", today)
    .orderBy("startDate", "asc")
    .limit(3)
    .get();

  let events: Event[] = upcomingSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  const remainingCount = 3 - events.length;

  // Step 2: If less than 3 found, fetch recent past events to fill the rest
  if (remainingCount > 0) {
    const pastSnapshot = await adminDb
      .collection("events")
      .where("startDate", "<", today)
      .orderBy("startDate", "desc")
      .limit(remainingCount)
      .get();

    const pastEvents = pastSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];

    events = [...events, ...pastEvents];
  }

  return (
    <section className="w-full bg-light min-h-screen flex items-center justify-center">
      <div className='w-full md:w-7xl mx-auto px-6 sm:px-8'>
        <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">We Need Your Support</h3>
        <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">Our Future Campaigns</h1>
        <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
          Join us as we plan our next steps in serving the community — from organizing free health camps to supporting underprivileged students. Your involvement can turn these plans into powerful realities.
        </p>

        <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10'>
          {events.map(event => (
            <EventCard event={event} key={event?.id} />
          ))}
        </div>

        <div className="flex justify-end mt-10">
          <Link
            href={`/events`}
            className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
          >
            View All Events
            <ArrowRight className="h-4 w-4 -rotate-45" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;

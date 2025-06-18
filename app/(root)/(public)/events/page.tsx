import EventCard from "@/components/cards/EventCard";
import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import Link from "next/link";

export const revalidate = 60; // ISR every 60 seconds

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
          startDate: data.startDate,
          endDate: data.endDate,
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
        startDate: data.startDate,
        endDate: data.endDate,
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
        startDate: data.startDate,
        endDate: data.endDate,
      };
    });

    const renderEventCard = (event: Event) => (<EventCard event={event} key={event?.id} />);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
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
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Fetching Events</h1>
          <p className="text-gray-600 mb-6">Something went wrong while loading events. Please try again later.</p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white font-medium py-2 px-6 rounded-full hover:bg-green-700 transition-all duration-200"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }
};

export default page;
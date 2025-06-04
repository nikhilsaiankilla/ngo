import { adminDb } from "@/firebase/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
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

    // 1. Ongoing Events: fetch startDate <= now, limit 20, then filter client-side for endDate >= now
    const ongoingSnapshot = await adminDb
      .collection("events")
      .where("startDate", "<=", now)
      .orderBy("startDate", "asc")
      .limit(20) // fetch a bit more so client-side filter can work well
      .get();

    const ongoingEvents: Event[] = ongoingSnapshot.docs
      .map(doc => {
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
      .filter(event => event.endDate >= new Date())
      .slice(0, 10);

    // 2. Upcoming Events: startDate > now, limit 10
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

    // 3. Past Events: endDate < now, limit 10
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

    return (
      <div className="p-4 space-y-10">
        {/* Ongoing Events */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Ongoing Events</h2>
          {ongoingEvents.length === 0 ? (
            <p>No ongoing events at the moment.</p>
          ) : (
            <ul>
              {ongoingEvents.map((event) => (
                <li key={event.id} className="mb-4 border p-3 rounded">
                  <h3 className="text-xl font-semibold">{event?.title || "N/A"}</h3>
                  <p>{event.tagline}</p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Start:</strong> {event.startDate.toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {event.endDate.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            <ul>
              {upcomingEvents.map((event) => (
                <li key={event.id} className="mb-4 border p-3 rounded">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p>{event.tagline}</p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Start:</strong> {event.startDate.toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {event.endDate.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Past Events</h2>
          {pastEvents.length === 0 ? (
            <p>No past events.</p>
          ) : (
            <ul>
              {pastEvents.map((event) => (
                <li key={event.id} className="mb-4 border p-3 rounded">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p>{event.tagline}</p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Start:</strong> {event.startDate.toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {event.endDate.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <h1 className="text-red-500 text-center mt-10">Error fetching events</h1>
    );
  }
};

export default page;

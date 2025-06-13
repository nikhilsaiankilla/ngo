"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { differenceInCalendarDays } from "date-fns";

export async function runDailyCleanup() {
    try {
        const snapshot = await adminDb.collection("event_participants").get();
        const now = new Date();

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const eventDate = data.eventDate?.toDate?.() || new Date(data.eventDate);
            const daysUntilEvent = differenceInCalendarDays(eventDate, now);

            if (daysUntilEvent === 2 && !data.notified2DaysBefore) {
                console.log(`2-day reminder: ${data.userEmail} for event: ${data.eventTitle}`);

                await doc.ref.update({ notified2DaysBefore: true });

            } else if (daysUntilEvent === 1 && !data.notified1DayBefore) {
                console.log(`1-day reminder: ${data.userEmail} for event: ${data.eventTitle}`);

                // Update field and then delete the document
                await doc.ref.update({ notified1DayBefore: true });
                await doc.ref.delete();
            }
        }
    } catch (error: unknown) {
        console.error("Error in daily cleanup:", error);
    }
}

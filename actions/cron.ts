"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { sendEmail } from "@/utils/mail";
import { DaysBeforeMailTemplate } from "@/utils/MailTemplates";
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

                const link = `https://ngo-two-ivory.vercel.app/events/${data?.eventLink}`

                const mailTemplate = DaysBeforeMailTemplate(2, data?.eventTitle, data?.userName, data?.eventDate, link)

                await sendEmail(data?.userEmail, "Just 2 Days Left! Your Spot is Confirmed for the Hussaini Welfare Campaign", mailTemplate);

                await doc.ref.update({ notified2DaysBefore: true });

            } else if (daysUntilEvent === 1 && !data.notified1DayBefore) {
                const link = `https://ngo-two-ivory.vercel.app/events/${data?.eventLink}`

                const mailTemplate = DaysBeforeMailTemplate(1, data?.eventTitle, data?.userName, data?.eventDate, link)

                await sendEmail(data?.userEmail, "Just 1 Days Left! Your Spot is Confirmed for the Hussaini Welfare Campaign", mailTemplate);

                // Update field and then delete the document
                await doc.ref.update({ notified1DayBefore: true });
                await doc.ref.delete();
            }
        }
    } catch (error: unknown) {
        console.error("Error in daily cleanup:", error);
    }
}

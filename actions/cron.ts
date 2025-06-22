"use server"

import { adminDb } from "@/firebase/firebaseAdmin";
import { sendEmail } from "@/utils/mail";
import { DaysBeforeMailTemplate } from "@/utils/MailTemplates";
import { differenceInCalendarDays } from "date-fns";

/**
 * Executes a daily cleanup task to send event reminders and manage event participant records.
 * Sends email notifications 2 days and 1 day before events, updates notification status,
 * and deletes records after the 1-day notification.
 * @returns A promise that resolves when the cleanup task is complete.
 */
export async function runDailyCleanup() {
    try {
        // Fetch all documents from the event_participants collection
        const snapshot = await adminDb.collection("event_participants").get();
        const now = new Date();

        // Iterate through each participant document
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // Convert eventDate to Date object, handling Firestore Timestamp or string
            const eventDate = data.eventDate?.toDate?.() || new Date(data.eventDate);
            // Calculate days until the event
            const daysUntilEvent = differenceInCalendarDays(eventDate, now);

            // Handle 2-day reminder
            if (daysUntilEvent === 2 && !data.notified2DaysBefore) {
                // Construct event link
                const link = `https://ngo-two-ivory.vercel.app/events/${data?.eventLink}`;
                // Generate email template for 2-day reminder
                const mailTemplate = DaysBeforeMailTemplate(
                    2,
                    data?.eventTitle,
                    data?.userName,
                    data?.eventDate,
                    link
                );

                // Send 2-day reminder email
                await sendEmail(
                    data?.userEmail,
                    "Just 2 Days Left! Your Spot is Confirmed for the Hussaini Welfare Campaign",
                    mailTemplate
                );

                // Update document to mark 2-day notification as sent
                await doc.ref.update({ notified2DaysBefore: true });
            }
            // Handle 1-day reminder and cleanup
            else if (daysUntilEvent === 1 && !data.notified1DayBefore) {
                // Construct event link
                const link = `https://ngo-two-ivory.vercel.app/events/${data?.eventLink}`;
                // Generate email template for 1-day reminder
                const mailTemplate = DaysBeforeMailTemplate(
                    1,
                    data?.eventTitle,
                    data?.userName,
                    data?.eventDate,
                    link
                );

                // Send 1-day reminder email
                await sendEmail(
                    data?.userEmail,
                    "Just 1 Day Left! Your Spot is Confirmed for the Hussaini Welfare Campaign",
                    mailTemplate
                );

                // Update document to mark 1-day notification as sent
                await doc.ref.update({ notified1DayBefore: true });
                // Delete the document after sending the 1-day notification
                await doc.ref.delete();
            }
        }
    } catch (error: unknown) {
        // Log any errors encountered during the cleanup process
        console.error("Error in daily cleanup:", error);
    }
}
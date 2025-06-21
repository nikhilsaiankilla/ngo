"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { deleteCloudinaryImage } from "./imageUpload";
import { extractCloudinaryPublicId } from "@/lib/utils";

interface AddEventInput {
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string; // hosted image URL
    startDate: Date;
    endDate: Date;
}

interface ServerResponse {
    success: boolean;
    message: string;
    status: number;
    data?: any;
}

export async function addEvent(data: AddEventInput): Promise<ServerResponse> {
    try {
        const {
            title,
            tagline,
            location,
            description,
            image,
            startDate,
            endDate,
        } = data;

        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "User Id is missing",
                status: 401,
            };
        }

        const userDocSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userDocSnap.data();

        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can add events.",
                status: 401,
            };
        }

        if (!title || !tagline || !location || !description || !image || !startDate || !endDate) {
            return {
                success: false,
                message: "All fields are required.",
                status: 400,
            };
        }

        const eventRef = await adminDb.collection("events").add({
            title,
            tagline,
            location,
            description,
            image,
            startDate: Timestamp.fromDate(new Date(startDate)),
            endDate: Timestamp.fromDate(new Date(endDate)),
            createdBy: userId,
            createdAt: Timestamp.now(),
        });

        return {
            success: true,
            message: "Event created successfully.",
            status: 200,
            data: {
                eventId: eventRef.id,
            },
        };
    } catch (err: unknown) {
        console.error("Error creating event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

type UpdateEventInput = {
    id: string;
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string | null;
    startDate: string | Date;
    endDate: string | Date;
};

export async function updateEvent(data: UpdateEventInput): Promise<ServerResponse> {
    try {
        const { id, title, tagline, location, description, image, startDate, endDate } = data;

        if (!id) {
            return {
                success: false,
                message: "Event ID is required.",
                status: 400,
            };
        }

        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "User Id is missing.",
                status: 401,
            };
        }

        const userDocSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userDocSnap.data();

        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can update events.",
                status: 401,
            };
        }

        if (!title || !tagline || !location || !description || !startDate || !endDate) {
            return {
                success: false,
                message: "Required fields are missing.",
                status: 400,
            };
        }

        const eventRef = adminDb.collection("events").doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return {
                success: false,
                message: "Event not found.",
                status: 404,
            };
        }

        const eventData = eventDoc.data();

        if (eventData) {
            if (eventData?.image !== image) {
                const publicId = extractCloudinaryPublicId(eventData?.image);

                if (publicId) {
                    await deleteCloudinaryImage(publicId);
                }
            }
        }

        await eventRef.update({
            title,
            tagline,
            location,
            description,
            image: image ?? "", // Handle null explicitly
            startDate: Timestamp.fromDate(new Date(startDate)),
            endDate: Timestamp.fromDate(new Date(endDate)),
            updatedAt: Timestamp.now(),
        });

        return {
            success: true,
            message: "Event updated successfully.",
            status: 200,
        };
    } catch (err: unknown) {
        console.error("Error updating event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

export async function deleteEvent(eventId: string) {
    try {
        // Step 1: Check if eventId is provided
        if (!eventId) {
            return {
                success: false,
                message: "Event ID is required",
                status: 400,
            };
        }

        // Step 2: Get current userId from cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "Unauthorized: User not logged in",
                status: 401,
            };
        }

        // Step 3: Fetch user data from Firestore
        const userRef = await adminDb.collection("users").doc(userId).get();
        const user = userRef.data();

        // Step 4: Check if user is an upper_trustie
        if (user?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can delete events",
                status: 403,
            };
        }

        // Step 5: Fetch the event to be deleted
        const eventDocRef = adminDb.collection("events").doc(eventId);
        const eventSnapshot = await eventDocRef.get();
        const eventData = eventSnapshot.data();

        // Step 6: Check if the event exists
        if (!eventData) {
            return {
                success: false,
                message: "Event not found",
                status: 404,
            };
        }

        // Optional: Verify that the event belongs to the same user (if needed)
        if (eventData.createdBy !== userId) {
            return {
                success: false,
                message: "Unauthorized: You can only delete your own events",
                status: 403,
            };
        }

        const publicId = extractCloudinaryPublicId(eventData?.image);
        if (publicId) {
            try {
                await deleteCloudinaryImage(publicId);
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error("Cloudinary deletion error:", error);
                }
                // Optionally log to a monitoring service here (e.g., Sentry, LogRocket)
            }
        }

        // Step 7: Delete the event
        await eventDocRef.delete();

        return {
            success: true,
            message: "Event deleted successfully",
            status: 200,
        };
    } catch (err: unknown) {
        console.error("Error while deleting event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

export async function handleEventParticipate(id: string) {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('userId')?.value;

        if (!userId) {
            return {
                success: false,
                message: "User ID is required",
                status: 400,
            };
        }

        if (!id) {
            return {
                success: false,
                message: "Event ID is required",
                status: 400,
            };
        }

        // Fetch user
        const userSnapshot = await adminDb.collection('users').doc(userId).get();
        const userData = userSnapshot.data();

        if (!userData) {
            return {
                success: false,
                message: "User not found",
                status: 404,
            };
        }

        if (userData.user_type === "REGULAR") {
            return {
                success: false,
                message: "Only Members and above can participate in events",
                status: 403,
            };
        }

        // Fetch event
        const eventSnapshot = await adminDb.collection('events').doc(id).get();
        const eventData = eventSnapshot.data();

        if (!eventData) {
            return {
                success: false,
                message: "Event not found",
                status: 404,
            };
        }

        const eventDate = eventData.startDate?.toDate?.();
        const now = new Date();
        const msInTwoDays = 2 * 24 * 60 * 60 * 1000;

        if (!eventDate || eventDate.getTime() - now.getTime() <= msInTwoDays) {
            return {
                success: false,
                message: "You can only participate in events that are at least 2 days away",
                status: 400,
            };
        }

        // Check for duplicate participation
        const existingQuery = await adminDb
            .collection('event_participants')
            .where('eventId', '==', id)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (!existingQuery.empty) {
            return {
                success: false,
                message: "You have already joined this event",
                status: 409, // Conflict
            };
        }

        // Add participant
        await adminDb.collection('event_participants').add({
            eventId: id,
            userId,
            joinedAt: Timestamp.now(),
            eventTitle: eventData.title,
            eventDate: eventData.startDate,
            userName: userData.name,
            userEmail: userData.email,
            notified1DayBefore: false,
            notified2DaysBefore: false,
        });


        // Add initial attendance record
        const attendanceQuery = await adminDb
            .collection('event_attendance')
            .where('eventId', '==', id)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (attendanceQuery.empty) {
            await adminDb.collection('event_attendance').add({
                eventId: id,
                userId,
                eventTitle: eventData.title,
                eventStartDate: eventData?.startDate,
                userName: userData.name,
                userEmail: userData.email,
                attended: "not_confirmed",
                confirmedAt: null,
            });
        }

        return {
            success: true,
            message: "Participation added successfully",
            status: 200,
        };
    } catch (error: unknown) {
        console.error("Error while handling participation:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

export async function checkUserParticipation(eventId: string) {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('userId')?.value;

        if (!userId || !eventId) {
            return {
                success: false,
                isParticipant: false,
                message: 'User or Event ID missing',
                status: 400,
            };
        }

        const query = await adminDb
            .collection('event_participants')
            .where('eventId', '==', eventId)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        return {
            success: true,
            isParticipant: !query.empty,
            status: 200,
        };
    } catch (error) {
        console.error('Error checking participation:', error);
        return {
            success: false,
            isParticipant: false,
            message: 'Server error',
            status: 500,
        };
    }
}

export async function handleCancelParticipation(eventId: string) {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get("userId")?.value;

        if (!userId || !eventId) {
            return {
                success: false,
                message: "User or Event ID missing",
                status: 400,
            };
        }

        // Search for participant document
        const snapshot = await adminDb
            .collection("event_participants")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return {
                success: false,
                message: "Participation not found",
                status: 404,
            };
        }

        const doc = snapshot.docs[0];

        await doc.ref.delete();

        // 2. Delete from event_attendance
        const attendanceSnapshot = await adminDb
            .collection("event_attendance")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (!attendanceSnapshot.empty) {
            await attendanceSnapshot.docs[0].ref.delete();
        }

        return {
            success: true,
            message: "Participation cancelled successfully",
            status: 200,
        };
    } catch (error: unknown) {
        console.error("Error cancelling participation:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

export async function fetchThePastEvent() {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "User Id missing",
                status: 400,
            };
        }

        const currentDate = new Date(); // Current date: June 11, 2025, 20:42 IST

        // Query event_attendance for the user's first past event
        const eventAttendanceRef = adminDb.collection("event_attendance");
        const attendanceQuery = eventAttendanceRef
            .where("userId", "==", userId)
            .where("attended", "==", "not_confirmed") // Only not_confirmed events
            .where("eventStartDate", "<", Timestamp.fromDate(currentDate)) // Past events
            .orderBy("eventStartDate", "asc") // Order by eventStartDate to get the earliest
            .limit(1);

        const attendanceSnapshot = await attendanceQuery.get();
        if (attendanceSnapshot.empty) {
            return {
                success: false,
                message: "No past events found with not confirmed status.",
                status: 404,
            };
        }

        // Get the first (earliest) attendance record
        const attendanceDoc = attendanceSnapshot.docs[0];
        const attendanceData = attendanceDoc.data();

        // Prepare event data for validation
        const eventResponse = {
            id: attendanceData.eventId,
            name: attendanceData.eventTitle, // Use eventTitle from event_attendance
            date: attendanceData.eventStartDate?.toDate().toISOString() || null
        };

        return {
            success: true,
            message: "Event Fetched successsfully",
            data: eventResponse,
            status: 200,
        };
    } catch (error: unknown) {
        console.error("Error cancelling participation:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

export async function saveAttendance(eventId: string, attendance: string) {
    try {
        const cookiesStore = await cookies();

        const userId = cookiesStore.get('userId')?.value;

        if (!userId) {
            return {
                success: false,
                message: "User Id missing",
                status: 400,
            };
        }

        if (!eventId || !attendance) {
            return {
                success: false,
                message: "Event Id or options are missing",
                status: 400,
            };
        }

        // Check if the user already has an attendance record for the event
        const existingAttendanceSnapshot = await adminDb
            .collection('event_attendance')
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        // Update existing attendance
        const docRef = existingAttendanceSnapshot.docs[0].ref;
        await docRef.update({
            attended: attendance,
            updatedAt: new Date(),
        });

        return {
            success: true,
            message: "Attendance updated successfully",
            status: 200,
        };
    } catch (error: unknown) {
        console.error("Error cancelling participation:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}
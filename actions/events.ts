"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { deleteCloudinaryImage } from "./imageUpload";
import { extractCloudinaryPublicId } from "@/lib/utils";
import { AddEventInput, ServerResponse, UpdateEventInput } from "@/types";
import { getCookiesFromServer } from "@/lib/serverUtils";

/**
 * Adds a new event to Firestore.
 * Only users with 'UPPER_TRUSTIE' role are allowed to create events.
 * 
 * @param data - The event details to create.
 * @returns A ServerResponse with the new event ID if successful.
 */
export async function addEvent(data: AddEventInput): Promise<ServerResponse> {
    try {
        const { title, tagline, location, description, image, startDate, endDate } = data;

        // Step 1: Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Step 2: Ensure the user is authenticated
        if (!userId) {
            return {
                success: false,
                message: "User Id is missing",
                status: 401, // Unauthorized
            };
        }

        // Step 3: Fetch user data from Firestore
        const userDocSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userDocSnap.data();

        // Step 4: Ensure user has permission to create events
        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can add events.",
                status: 401, // Unauthorized
            };
        }

        // Step 5: Validate required fields
        if (!title || !tagline || !location || !description || !image || !startDate || !endDate) {
            return {
                success: false,
                message: "All fields are required.",
                status: 400, // Bad Request
            };
        }

        // Step 6: Create the event in Firestore
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

        // Step 7: Return success response with new event ID
        return {
            success: true,
            message: "Event created successfully.",
            status: 200, // OK
            data: {
                eventId: eventRef.id,
            },
        };
    } catch (err: unknown) {
        // Log unexpected error
        console.error("Error creating event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500, // Internal Server Error
        };
    }
}


/**
 * Updates an existing event in Firestore.
 * Only users with 'UPPER_TRUSTIE' role can update events.
 * Also handles Cloudinary image deletion if the image is changed.
 * 
 * @param data - The event details to update.
 * @returns A ServerResponse indicating the result of the operation.
 */
export async function updateEvent(data: UpdateEventInput): Promise<ServerResponse> {
    try {
        const { id, title, tagline, location, description, image, startDate, endDate } = data;

        // Step 1: Validate that event ID is provided
        if (!id) {
            return {
                success: false,
                message: "Event ID is required.",
                status: 400, // Bad Request
            };
        }

        // Step 2: Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Step 3: Ensure the user is authenticated
        if (!userId) {
            return {
                success: false,
                message: "User Id is missing.",
                status: 401, // Unauthorized
            };
        }

        // Step 4: Fetch user data from Firestore
        const userDocSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userDocSnap.data();

        // Step 5: Ensure user has permission to update the event
        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can update events.",
                status: 401, // Unauthorized
            };
        }

        // Step 6: Validate required fields
        if (!title || !tagline || !location || !description || !startDate || !endDate) {
            return {
                success: false,
                message: "Required fields are missing.",
                status: 400, // Bad Request
            };
        }

        // Step 7: Check if the event exists in Firestore
        const eventRef = adminDb.collection("events").doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return {
                success: false,
                message: "Event not found.",
                status: 404, // Not Found
            };
        }

        // Step 8: Handle Cloudinary image cleanup if the image was changed
        const eventData = eventDoc.data();
        if (eventData && eventData?.image !== image) {
            const publicId = extractCloudinaryPublicId(eventData.image);
            if (publicId) {
                try {
                    await deleteCloudinaryImage(publicId);
                } catch (err) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.error("Cloudinary deletion error:", err);
                    }
                    // Optional: Log to a monitoring service
                }
            }
        }

        // Step 9: Update event details in Firestore
        await eventRef.update({
            title,
            tagline,
            location,
            description,
            image: image ?? "", // Ensure image is not undefined
            startDate: Timestamp.fromDate(new Date(startDate)),
            endDate: Timestamp.fromDate(new Date(endDate)),
            updatedAt: Timestamp.now(),
        });

        // Step 10: Return success response
        return {
            success: true,
            message: "Event updated successfully.",
            status: 200, // OK
        };
    } catch (err: unknown) {
        // Log unexpected error
        console.error("Error updating event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500, // Internal Server Error
        };
    }
}

/**
 * Deletes an event from the Firestore database.
 * Only users with 'UPPER_TRUSTIE' role who created the event are authorized to perform this action.
 * Also attempts to delete the event image from Cloudinary if present.
 * 
 * @param eventId - The ID of the event to be deleted.
 * @returns A ServerActionResponse indicating the result of the deletion operation.
 */
export async function deleteEvent(eventId: string) {
    try {
        // Step 1: Validate that eventId is provided
        if (!eventId) {
            return {
                success: false,
                message: "Event ID is required",
                status: 400, // Bad Request: missing event ID
            };
        }

        // Step 2: Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Step 3: Check if the user is authenticated
        if (!userId) {
            return {
                success: false,
                message: "Unauthorized: User not logged in",
                status: 401, // Unauthorized: user not authenticated
            };
        }

        // Step 4: Fetch user data from Firestore
        const userRef = await adminDb.collection("users").doc(userId).get();
        const user = userRef.data();

        // Step 5: Check if the user has 'UPPER_TRUSTIE' role
        if (user?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can delete events",
                status: 403, // Forbidden: insufficient permissions
            };
        }

        // Step 6: Fetch the event to be deleted
        const eventDocRef = adminDb.collection("events").doc(eventId);
        const eventSnapshot = await eventDocRef.get();
        const eventData = eventSnapshot.data();

        // Step 7: Check if the event exists
        if (!eventData) {
            return {
                success: false,
                message: "Event not found",
                status: 404, // Not Found: event doesn't exist
            };
        }

        // Step 8: Verify that the user is the creator of the event
        if (eventData.createdBy !== userId) {
            return {
                success: false,
                message: "Unauthorized: You can only delete your own events",
                status: 403, // Forbidden: cannot delete someone else's event
            };
        }

        // Step 9: Attempt to delete the event's image from Cloudinary (if exists)
        const publicId = extractCloudinaryPublicId(eventData?.image);
        if (publicId) {
            try {
                await deleteCloudinaryImage(publicId);
            } catch (error) {
                // Log Cloudinary deletion error only in non-production environments
                if (process.env.NODE_ENV !== 'production') {
                    console.error("Cloudinary deletion error:", error);
                }
                // Optional: Forward error to monitoring services (e.g., Sentry)
            }
        }

        // Step 10: Delete the event document from Firestore
        await eventDocRef.delete();

        // Step 11: Return success response
        return {
            success: true,
            message: "Event deleted successfully",
            status: 200, // OK: Event deleted
        };
    } catch (err: unknown) {
        // Log unexpected server-side error
        console.error("Error while deleting event:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500, // Internal Server Error: unexpected issue
        };
    }
}


/**
 * Handles user participation in a specified event.
 * Validates the user, event, and business rules before registering the participant and creating an initial attendance record.
 * 
 * @param id - The ID of the event to participate in.
 * @returns A ServerActionResponse object indicating the result of the operation.
 */
export async function handleEventParticipate(id: string) {
    try {
        // Retrieve userId from server-side cookies
        const { userId } = await getCookiesFromServer();

        // Validate authentication
        if (!userId) {
            return {
                success: false,
                message: "User ID is required",
                status: 401, // Unauthorized: user not logged in
            };
        }

        // Validate input parameter
        if (!id) {
            return {
                success: false,
                message: "Event ID is required",
                status: 400, // Bad Request: missing event ID
            };
        }

        // Fetch user details from the database
        const userSnapshot = await adminDb.collection('users').doc(userId).get();
        const userData = userSnapshot.data();

        // Validate user existence
        if (!userData) {
            return {
                success: false,
                message: "User not found",
                status: 404, // Not Found: user does not exist
            };
        }

        // Check if the user has the required role to participate
        if (userData.user_type === "REGULAR") {
            return {
                success: false,
                message: "Only Members and above can participate in events",
                status: 403, // Forbidden: insufficient permissions
            };
        }

        // Fetch event details from the database
        const eventSnapshot = await adminDb.collection('events').doc(id).get();
        const eventData = eventSnapshot.data();

        // Validate event existence
        if (!eventData) {
            return {
                success: false,
                message: "Event not found",
                status: 404, // Not Found: event does not exist
            };
        }

        // Ensure event is at least 2 days away
        const eventDate = eventData.startDate?.toDate?.();
        const now = new Date();
        const msInTwoDays = 2 * 24 * 60 * 60 * 1000;

        if (!eventDate || eventDate.getTime() - now.getTime() <= msInTwoDays) {
            return {
                success: false,
                message: "You can only participate in events that are at least 2 days away",
                status: 400, // Bad Request: event too close
            };
        }

        // Check if the user is already registered for the event
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
                status: 409, // Conflict: duplicate participation
            };
        }

        // Register the user as an event participant
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

        // Create initial attendance record if one doesn't already exist
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

        // Return success response
        return {
            success: true,
            message: "Participation added successfully",
            status: 200, // OK: Participation successful
        };
    } catch (error: unknown) {
        // Log and return server-side error response
        console.error("Error while handling participation:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500, // Internal Server Error: Unexpected issue
        };
    }
}


/**
 * Checks if the authenticated user is a participant in a specified event.
 * @param eventId - The ID of the event to check participation for.
 * @returns A promise resolving to a ServerActionResponse indicating whether the user is a participant.
 */
export async function checkUserParticipation(eventId: string) {
    try {
        // Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Validate user authentication and input parameters
        if (!userId) {
            return {
                success: false,
                isParticipant: false,
                message: 'User ID missing',
                status: 401, // Unauthorized: User not authenticated
            };
        }
        if (!eventId) {
            return {
                success: false,
                isParticipant: false,
                message: 'Event ID missing',
                status: 400, // Bad Request: Missing required parameter
            };
        }

        // Query event_participants collection for a record matching the user and event
        const query = await adminDb
            .collection('event_participants')
            .where('eventId', '==', eventId)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        // Return success response indicating participation status
        return {
            success: true,
            isParticipant: !query.empty,
            message: `Participation check completed ${!query.empty ? 'successfully' : 'successfully, no participation found'}`,
            status: 200, // OK: Query executed successfully
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error('Error checking participation:', error);
        // Return error response with detailed message
        return {
            success: false,
            isParticipant: false,
            message: getErrorMessage(error),
            status: 500, // Internal Server Error: Unexpected error
        };
    }
}

/**
 * Cancels a user's participation in an event by removing their records from the event_participants and event_attendance collections.
 * @param eventId - The ID of the event to cancel participation for.
 * @returns A promise resolving to a ServerActionResponse indicating the result of the cancellation process.
 */
export async function handleCancelParticipation(eventId: string) {
    try {
        // Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Validate user authentication and input parameters
        if (!userId) {
            return {
                success: false,
                message: "User ID missing",
                status: 401, // Unauthorized: User not authenticated
            };
        }
        if (!eventId) {
            return {
                success: false,
                message: "Event ID missing",
                status: 400, // Bad Request: Missing required parameter
            };
        }

        // Query for the user's participation record in event_participants
        const snapshot = await adminDb
            .collection("event_participants")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        // Check if a participation record exists
        if (snapshot.empty) {
            return {
                success: false,
                message: "Participation record not found",
                status: 404, // Not Found: No matching record
            };
        }

        // Delete the participation record
        const doc = snapshot.docs[0];
        await doc.ref.delete();

        // Query for the user's attendance record in event_attendance
        const attendanceSnapshot = await adminDb
            .collection("event_attendance")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        // Delete the attendance record if it exists
        if (!attendanceSnapshot.empty) {
            await attendanceSnapshot.docs[0].ref.delete();
        }

        // Return success response
        return {
            success: true,
            message: "Participation cancelled successfully",
            status: 200, // OK: Cancellation successful
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Error cancelling participation:", error);
        // Return error response
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500, // Internal Server Error: Unexpected error
        };
    }
}

/**
 * Retrieves the earliest past event with a "not_confirmed" attendance status for the authenticated user.
 * @returns A promise resolving to a ServerActionResponse containing the event details or an error message.
 */
export async function fetchThePastEvent() {
    try {
        // Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Validate user authentication
        if (!userId) {
            return {
                success: false,
                message: "User ID missing",
                status: 401, // Unauthorized: User not authenticated
            };
        }

        // Get the current date for comparison
        const currentDate = new Date();

        // Query event_attendance collection for the user's earliest past event
        const eventAttendanceRef = adminDb.collection("event_attendance");
        const attendanceQuery = eventAttendanceRef
            .where("userId", "==", userId)
            .where("attended", "==", "not_confirmed") // Filter for not_confirmed status
            .where("eventStartDate", "<", Timestamp.fromDate(currentDate)) // Filter for past events
            .orderBy("eventStartDate", "asc") // Order by event start date to get the earliest
            .limit(1); // Limit to one result

        // Execute the query
        const attendanceSnapshot = await attendanceQuery.get();

        // Check if any matching events were found
        if (attendanceSnapshot.empty) {
            return {
                success: false,
                message: "No past events found with not_confirmed status",
                status: 404, // Not Found: No matching records
            };
        }

        // Extract data from the earliest attendance record
        const attendanceDoc = attendanceSnapshot.docs[0];
        const attendanceData = attendanceDoc.data();

        // Prepare event data for response
        const eventResponse = {
            id: attendanceData.eventId,
            name: attendanceData.eventTitle,
            date: attendanceData.eventStartDate?.toDate().toISOString() || null,
        };

        // Return success response with event data
        return {
            success: true,
            message: "Event fetched successfully",
            data: eventResponse,
            status: 200, // OK: Event retrieved successfully
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Error fetching past event:", error);
        // Return error response
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500, // Internal Server Error: Unexpected error
        };
    }
}

/**
 * Updates a user's attendance record for a specified event in the database.
 * @param eventId - The ID of the event.
 * @param attendance - The attendance status to record (e.g., "present", "absent").
 * @returns A promise resolving to a ServerActionResponse indicating the result of the operation.
 */
export async function saveAttendance(eventId: string, attendance: string) {
    try {
        // Retrieve userId from server cookies
        const { userId } = await getCookiesFromServer();

        // Validate user authentication
        if (!userId) {
            return {
                success: false,
                message: "User ID missing",
                status: 401, // Unauthorized: User not authenticated
            };
        }

        // Validate input parameters
        if (!eventId || !attendance) {
            return {
                success: false,
                message: "Event ID or attendance status missing",
                status: 400, // Bad Request: Missing required parameters
            };
        }

        // Query for existing attendance record for the user and event
        const existingAttendanceSnapshot = await adminDb
            .collection('event_attendance')
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        // Check if an attendance record exists
        if (existingAttendanceSnapshot.empty) {
            return {
                success: false,
                message: "No attendance record found for this user and event",
                status: 404, // Not Found: No matching record
            };
        }

        // Update the existing attendance record
        const docRef = existingAttendanceSnapshot.docs[0].ref;
        await docRef.update({
            attended: attendance,
            updatedAt: new Date(),
        });

        // Return success response
        return {
            success: true,
            message: "Attendance updated successfully",
            status: 200, // OK: Update successful
        };
    } catch (error: unknown) {
        // Log error for debugging purposes
        console.error("Error saving attendance:", error);
        // Return error response
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500, // Internal Server Error: Unexpected error
        };
    }
}
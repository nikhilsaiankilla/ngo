"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";

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
    image: string;
    startDate: string | Date;
    endDate: string | Date;
};

export async function updateEvent(data: UpdateEventInput): Promise<ServerResponse> {
    try {
        const {
            id,
            title,
            tagline,
            location,
            description,
            image,
            startDate,
            endDate,
        } = data;

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

        if (!title || !tagline || !location || !description || !image || !startDate || !endDate) {
            return {
                success: false,
                message: "All fields are required.",
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

        await eventRef.update({
            title,
            tagline,
            location,
            description,
            image,
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

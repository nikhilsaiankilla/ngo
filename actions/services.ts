"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { extractCloudinaryPublicId } from "@/lib/utils";
import { deleteCloudinaryImage } from "./imageUpload";
import { AddServiceInput, ServerResponse, UpdateServiceInput } from "@/types";
import { getCookiesFromServer } from "@/lib/serverUtils";

/**
 * addService
 * ----------
 * Adds a new service entry to the Firestore `services` collection.
 *
 * Flow:
 * 1. Validates user authentication and role.
 * 2. Validates input fields for completeness.
 * 3. Adds a new service document with metadata like createdBy and createdAt.
 *
 * Only users with the role `UPPER_TRUSTIE` are authorized to perform this action.
 *
 * @param data - Object containing service title, tagline, description, and image URL.
 * 
 * @returns ServerResponse - Standardized API response structure with status, message, and optional data.
 */

export async function addService(data: AddServiceInput): Promise<ServerResponse> {
    try {
        const { title, tagline, description, image } = data;

        // Step 1: Get the user ID from cookies/session
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "User Id is missing",
                status: 401,
            };
        }

        // Step 2: Fetch the user's document to verify permissions
        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userSnap.data();

        // Step 3: Ensure only 'UPPER_TRUSTIE' users can add services
        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can add services.",
                status: 401,
            };
        }

        // Step 4: Validate required fields
        if (!title || !tagline || !description || !image) {
            return {
                success: false,
                message: "All fields are required.",
                status: 400,
            };
        }

        // Step 5: Add the new service to the Firestore collection
        const serviceRef = await adminDb.collection("services").add({
            title,
            tagline,
            description,
            image,
            createdBy: userId,
            createdAt: Timestamp.now(),
        });

        return {
            success: true,
            message: "Service created successfully.",
            status: 200,
            data: { serviceId: serviceRef.id },
        };
    } catch (err: unknown) {
        // Step 6: Handle unexpected errors
        console.error("Error creating service:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

/**
 * updateService
 * -------------
 * Updates an existing service document in the Firestore `services` collection.
 *
 * Flow:
 * 1. Verifies service ID and user authentication.
 * 2. Checks if the user is authorized to perform the update (must be `UPPER_TRUSTIE`).
 * 3. Deletes the old image from Cloudinary if the image URL has changed.
 * 4. Updates the service fields and adds an `updatedAt` timestamp.
 *
 * @param data - Object containing the service ID and updated fields (title, tagline, description, image).
 *
 * @returns ServerResponse - Standardized API response with status, message, and optional data.
 */

export async function updateService(data: UpdateServiceInput): Promise<ServerResponse> {
    try {
        const { id, title, tagline, description, image } = data;

        // Step 1: Validate required service ID
        if (!id) {
            return {
                success: false,
                message: "Service ID is required.",
                status: 400,
            };
        }

        // Step 2: Retrieve user ID from cookies/session
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "User Id is missing.",
                status: 401,
            };
        }

        // Step 3: Fetch user data and check for 'UPPER_TRUSTIE' role
        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userSnap.data();

        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can update services.",
                status: 401,
            };
        }

        // Step 4: Retrieve the service document
        const serviceRef = adminDb.collection("services").doc(id);
        const serviceDoc = await serviceRef.get();

        if (!serviceDoc.exists) {
            return {
                success: false,
                message: "Service not found.",
                status: 404,
            };
        }

        const serviceData = serviceDoc.data();

        // Step 5: Delete the old image from Cloudinary if the image has changed
        if (serviceData && serviceData.image !== image) {
            const publicId = extractCloudinaryPublicId(serviceData.image);

            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        // Step 6: Update the service document
        await serviceRef.update({
            title,
            tagline,
            description,
            image,
            updatedAt: Timestamp.now(),
        });

        return {
            success: true,
            message: "Service updated successfully.",
            status: 200,
        };
    } catch (err: unknown) {
        // Step 7: Catch and handle unexpected errors
        console.error("Error updating service:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}


/**
 * deleteService
 * -------------
 * Deletes a service from the Firestore `services` collection if the user is authenticated,
 * authorized (`UPPER_TRUSTIE`), and the creator of the service.
 *
 * Steps:
 * 1. Validates service ID.
 * 2. Authenticates user from cookies.
 * 3. Authorizes user based on role (`UPPER_TRUSTIE`) and ownership.
 * 4. Deletes the associated Cloudinary image if present.
 * 5. Deletes the Firestore service document.
 *
 * @param serviceId - ID of the service document to be deleted.
 *
 * @returns ServerResponse - Standard API response format.
 */

export async function deleteService(serviceId: string): Promise<ServerResponse> {
    try {
        // Step 1: Validate service ID
        if (!serviceId) {
            return {
                success: false,
                message: "Service ID is required.",
                status: 400,
            };
        }

        // Step 2: Get user ID from cookies/session
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "Unauthorized: User not logged in",
                status: 401,
            };
        }

        // Step 3: Fetch user data and check role
        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const user = userSnap.data();

        if (user?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can delete services",
                status: 403,
            };
        }

        // Step 4: Retrieve the service document
        const serviceRef = adminDb.collection("services").doc(serviceId);
        const serviceSnap = await serviceRef.get();
        const serviceData = serviceSnap.data();

        if (!serviceData) {
            return {
                success: false,
                message: "Service not found",
                status: 404,
            };
        }

        // Step 5: Check if the logged-in user is the service creator
        if (serviceData.createdBy !== userId) {
            return {
                success: false,
                message: "Unauthorized: You can only delete your own services",
                status: 403,
            };
        }

        // Step 6: Attempt to delete the image from Cloudinary if it exists
        const publicId = extractCloudinaryPublicId(serviceData.image);
        if (publicId) {
            try {
                await deleteCloudinaryImage(publicId);
            } catch (error) {
                // Log Cloudinary errors in non-production or monitoring services
                if (process.env.NODE_ENV !== "production") {
                    console.error("Cloudinary deletion error:", error);
                }
            }
        }

        // Step 7: Delete the service document from Firestore
        await serviceRef.delete();

        return {
            success: true,
            message: "Service deleted successfully",
            status: 200,
        };
    } catch (err: unknown) {
        console.error("Error deleting service:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}


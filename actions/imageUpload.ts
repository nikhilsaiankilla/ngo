"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { getCookiesFromServer } from "@/lib/serverUtils";
import { extractCloudinaryPublicId } from "@/lib/utils";
import { cloudinary } from "@/utils/cloudinaryConfig";
import { getErrorMessage } from "@/utils/helpers";

/**
 * Uploads or updates a user's profile picture.
 *
 * This function:
 *  - Retrieves the user's ID from cookies.
 *  - Validates the user and checks if they exist in Firestore.
 *  - If a different profile picture is already present, it removes the old image from Cloudinary.
 *  - Updates the Firestore document with the new image URL.
 *
 * @param imageUrl - The new profile image URL (typically from Cloudinary).
 * @returns A ServerResponse object indicating success or failure.
 */

export async function uploadProfilePicture(imageUrl: string) {
    try {
        // Get the logged-in user's ID from the server cookies
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "Unauthorized access",
                status: 401,
            };
        }

        // Get reference and data of the user from Firestore
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return {
                success: false,
                message: "User not found",
                status: 404,
            };
        }

        const user = userDoc.data();

        /**
         * If a previous photo exists and it differs from the new one,
         * remove the old image from Cloudinary storage.
         */
        if (user?.photoURL && imageUrl !== user.photoURL) {
            const publicId = extractCloudinaryPublicId(user.photoURL);

            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        // Update the user document with the new photo URL
        await userRef.update({
            photoURL: imageUrl,
        });

        return {
            success: true,
            message: "Profile picture updated successfully",
            status: 200,
            data: { imageUrl },
        };
    } catch (error: unknown) {
        // Handle unexpected errors and return meaningful response
        console.error("uploadProfilePicture error:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

/**
 * Deletes an image from Cloudinary using the provided public ID.
 *
 * Steps:
 *  - Retrieves the user ID from server-side cookies to ensure authorized access.
 *  - Validates the presence of a publicId to delete.
 *  - Calls Cloudinary's API to delete the image using the uploader.destroy method.
 *  - Returns a success or failure response based on the result.
 *
 * @param publicId - The unique public ID of the Cloudinary image to be deleted.
 * @returns A ServerResponse indicating the success or failure of the deletion.
 */

export async function deleteCloudinaryImage(publicId: string) {
    try {
        // Validate user authentication using cookies
        const { userId } = await getCookiesFromServer();

        if (!userId) {
            return {
                success: false,
                message: "Unauthorized access",
                status: 401,
            };
        }

        // Validate presence of the publicId
        if (!publicId) {
            return {
                success: false,
                message: "Public ID is missing",
                status: 400,
            };
        }

        // Attempt to delete the image from Cloudinary
        const res = await cloudinary.uploader.destroy(publicId);

        // Cloudinary returns { result: 'ok' } for successful deletes
        if (res.result !== "ok") {
            return {
                success: false,
                message: res?.result || "Something went wrong during deletion",
                status: 400,
            };
        }

        return {
            success: true,
            message: "Image deleted successfully",
            status: 200,
        };
    } catch (error: unknown) {
        // Catch and return any unexpected server-side errors
        console.error("deleteCloudinaryImage error:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

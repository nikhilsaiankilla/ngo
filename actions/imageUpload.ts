"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { cloudinary } from "@/utils/cloudinaryConfig";
import { getErrorMessage } from "@/utils/helpers";
import { cookies } from "next/headers";

export async function uploadProfilePicture(imageUrl: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return { success: false, message: "unauthorized access", status: 400 };
        }

        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, message: "User not found", status: 404 };
        }

        await userRef.update({
            profilePicture: imageUrl,
        });

        return {
            success: true,
            message: "Profile picture updated successfully",
            status: 200,
            data: { imageUrl },
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}

export async function deleteCloudinaryImage(publicId: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return { success: false, message: "unauthorized access", status: 400 };
        }

        if (!publicId) {
            return { success: false, message: "Public id is missing", status: 400 };
        }

        const res = await cloudinary.uploader.destroy(publicId)

        if (!res.ok) {
            return { success: false, message: res?.message || "someting went wrong", status: 400 };
        }

        return { success: true, message: "deleted successfully", status: 400 };
    } catch (error: unknown) {
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}
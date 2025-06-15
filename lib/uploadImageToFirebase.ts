// lib/uploadImageToFirebase.ts

import { storage } from "@/firebase/firebase";
import { getErrorMessage } from "@/utils/helpers";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface UploadResult {
    success: boolean;
    message?: string;
    status: number,
    data?: { url: string };
}

export default async function uploadImageToFirebase(file: File): Promise<UploadResult> {
    try {
        if (!file) {
            return {
                success: false,
                status: 200,
                message: "image is required"
            };
        }

        const storageRef = ref(storage, `images/${file.name}`); // Create a reference to the file in Firebase Storage

        await uploadBytes(storageRef, file); // Upload the file to Firebase Storage
        const url = await getDownloadURL(storageRef); // Get the download URL of the uploaded file

        return {
            success: true,
            status: 200,
            data: { url: url },
        };
    } catch (error: unknown) {
        console.error("Firebase upload error:", error);
        return {
            success: false,
            message: getErrorMessage(error),
            status: 500,
        };
    }
}
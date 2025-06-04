// lib/uploadImageToFirebase.ts
import { storage } from "@/firebase/firebase";
import { getErrorMessage } from "@/utils/helpers";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

interface UploadResult {
    success: boolean;
    message?: string;
    status: number,
    data?: { url: string };
}

export default async function uploadImageToFirebase(file: File): Promise<UploadResult> {
    try {
        const filePath = `event_images/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);

        return {
            success: true,
            status: 200,
            data: { url: downloadURL },
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

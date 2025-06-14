"use server"
import { cloudinary } from "@/utils/cloudinaryConfig";

export const uploadImageToCloudinary = async (
    fileUri: string,
    destination: string = ""
): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: `hussaini-welfare/${destination}`,
        });

        // Return the secure URL of the uploaded image
        return result.secure_url;
    } catch (error: unknown) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

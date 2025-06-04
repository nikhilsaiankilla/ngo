"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { getErrorMessage } from "@/utils/helpers";
import { Timestamp } from "firebase-admin/firestore";

interface AddServiceInput {
    title: string;
    tagline: string;
    description: string;
    image: string; // hosted image URL
}

interface ServerResponse {
    success: boolean;
    message: string;
    status: number;
    data?: any;
}

export async function addService(data: AddServiceInput): Promise<ServerResponse> {
    try {
        const { title, tagline, description, image } = data;

        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "User Id is missing",
                status: 401,
            };
        }

        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userSnap.data();

        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can add services.",
                status: 401,
            };
        }

        if (!title || !tagline || !description || !image) {
            return {
                success: false,
                message: "All fields are required.",
                status: 400,
            };
        }

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
        console.error("Error creating service:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

interface UpdateServiceInput {
    id: string;
    title: string;
    tagline: string;
    description: string;
    image: string;
}

export async function updateService(data: UpdateServiceInput): Promise<ServerResponse> {
    try {
        const { id, title, tagline, description, image } = data;

        if (!id) {
            return {
                success: false,
                message: "Service ID is required.",
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

        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const userData = userSnap.data();

        if (userData?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can update services.",
                status: 401,
            };
        }

        const serviceRef = adminDb.collection("services").doc(id);
        const serviceDoc = await serviceRef.get();

        if (!serviceDoc.exists) {
            return {
                success: false,
                message: "Service not found.",
                status: 404,
            };
        }

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
        console.error("Error updating service:", err);
        return {
            success: false,
            message: getErrorMessage(err),
            status: 500,
        };
    }
}

export async function deleteService(serviceId: string): Promise<ServerResponse> {
    try {
        if (!serviceId) {
            return {
                success: false,
                message: "Service ID is required.",
                status: 400,
            };
        }

        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return {
                success: false,
                message: "Unauthorized: User not logged in",
                status: 401,
            };
        }

        const userSnap = await adminDb.doc(`users/${userId}`).get();
        const user = userSnap.data();

        if (user?.user_type !== "UPPER_TRUSTIE") {
            return {
                success: false,
                message: "Unauthorized: Only upper_trustie can delete services",
                status: 403,
            };
        }

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

        if (serviceData.createdBy !== userId) {
            return {
                success: false,
                message: "Unauthorized: You can only delete your own services",
                status: 403,
            };
        }

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

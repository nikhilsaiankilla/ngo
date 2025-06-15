"use client";

import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import ImageCropper from "./ImageCropper";
import { uploadImageToCloudinary } from "@/lib/uploadImageToCloudinary";
import { uploadProfilePicture } from "@/actions/imageUpload";
import { Input } from "./ui/input";

const ProfilePicture = ({
    imageUrl,
    name,
}: {
    imageUrl?: string;
    name: string;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showCropper, setShowCropper] = useState(false);
    const [tempImageBase64, setTempImageBase64] = useState<string | null>(null);
    const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(null);
    const [localImageUrl, setLocalImageUrl] = useState(imageUrl);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImageBase64(reader.result as string);
            setShowCropper(true);
            setIsEditing(true); // ✅ this makes the cropper open
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBase64: string) => {
        setShowCropper(false);
        setIsEditing(false);
        await uploadImage(croppedBase64); // pass directly
    };

    const uploadImage = async (croppedBase64: string) => {
        if (!croppedBase64) {
            toast.error("Cropped image is missing")
            return;
        }

        setLoading(true);
        try {
            const uploadedUrl = await uploadImageToCloudinary(
                croppedBase64,
                "/profile"
            );

            if (!uploadedUrl) {
                toast.error("Failed to upload image.");
                return;
            }

            const res = await uploadProfilePicture(uploadedUrl);

            if (!res.success) {
                toast.error(res?.message);
                return;
            }

            setLocalImageUrl(uploadedUrl);
            toast.success("Profile picture uploaded successfully");

            setTempImageBase64(null);
            setCroppedImageBase64(null);
        } catch (error) {
            toast.error("Something went wrong while uploading image");
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };


    return (
        <div className="w-32 h-32 relative">
            {/* Profile image */}
            <Image
                src={
                    localImageUrl ||
                    "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png"
                }
                alt={name || "User"}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover border border-gray-300"
            />

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-5 rounded-full">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
            )}

            {/* Cropper */}
            {isEditing && showCropper && tempImageBase64 && (
                <ImageCropper
                    ratio={1}
                    imageSrc={tempImageBase64}
                    onComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setIsEditing(false);
                    }}
                />
            )}

            {/* Upload icon */}
            {!isEditing && (
                <label
                    className={`absolute -bottom-1 right-3 p-2 bg-black rounded-full text-white cursor-pointer transition-opacity ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-100"
                        }`}
                >
                    <Upload size={20} />
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={loading}
                    />
                </label>
            )}
        </div>
    );
};

export default ProfilePicture;

// components/ImageCropper.tsx
"use client";

import Cropper, { Area } from "react-easy-crop";
import { useCallback, useState } from "react";
import getCroppedImg from "@/lib/getCroppedImage";
import { Button } from "./ui/button";

interface Props {
    ratio?: number,
    imageSrc: string;
    onComplete: (croppedBase64: string) => void;
    onCancel: () => void;
}

export default function ImageCropper({ ratio, imageSrc, onComplete, onCancel }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback(
        (_: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleDone = async () => {
        if (!croppedAreaPixels) return;

        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onComplete(croppedImage);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-lg h-[400px] bg-white">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={ratio ? ratio : 4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="flex gap-4 mt-4">
                <Button
                    type="button"
                    onClick={handleDone}
                    className="bg-green-500 px-4 py-2 rounded text-white"
                >
                    Crop
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 px-4 py-2 rounded text-white"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}

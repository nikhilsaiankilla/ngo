"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
import { addEvent } from "@/actions/events";
import { getErrorMessage } from "@/utils/helpers";
import { Loader } from "lucide-react";
import Image from "next/image";
import FormTemplate from "./FormTemplate";
import { uploadImageToCloudinary } from "@/lib/uploadImageToCloudinary";
import ImageCropper from "../ImageCropper";

// Schema & types
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    location: z.string().min(1, "Location is required"),
    image: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EventUploadForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageBase64, setTempImageBase64] = useState<string | null>(null);
    const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            tagline: "",
            location: "",
            image: null,
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImageBase64(reader.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (croppedBase64: string) => {
        setCroppedImageBase64(croppedBase64);
        setImagePreview(croppedBase64);
        setShowCropper(false);
    };

    const onSubmit = async (values: FormValues) => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates.");
            return;
        }

        if (endDate < startDate) {
            toast.error("End date must be after start date.");
            return;
        }

        setIsLoading(true);
        let imageUrl = "";

        try {
            if (croppedImageBase64) {
                const uploadedUrl = await uploadImageToCloudinary(croppedImageBase64, "/events");
                if (!uploadedUrl) {
                    toast.error("Failed to upload image.");
                    return;
                }
                imageUrl = uploadedUrl;
            } else {
                toast.error("Please upload and crop an image.");
                return;
            }

            const finalData = {
                ...values,
                image: imageUrl,
                description,
                startDate,
                endDate,
            };

            const response = await addEvent(finalData);

            if (response.success) {
                toast.success("Event added successfully!");
                form.reset();
                setDescription("");
                setStartDate(undefined);
                setEndDate(undefined);
                setImagePreview("");
            } else {
                toast.error("Failed to add event: " + response.message);
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormTemplate title="Add Event Form" description="Add your Event details">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Event title" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tagline</FormLabel>
                                <FormControl>
                                    <Input placeholder="Short tagline" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Event location" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Markdown)</Label>
                        <MDEditor
                            value={description}
                            onChange={(val) => setDescription(val || "")}
                            preview="edit"
                            height={300}
                            textareaProps={{
                                placeholder: "Briefly describe your idea and what problem it solves",
                            }}
                            previewOptions={{ disallowedElements: ["style"] }}
                            className="mt-2"
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="image"
                        render={() => (
                            <FormItem>
                                <FormLabel>Upload Image</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                                {imagePreview && (
                                    <Image
                                        width={10}
                                        height={10}
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 rounded-md w-full h-auto max-h-64 object-contain"
                                    />
                                )}
                            </FormItem>
                        )}
                    />

                    {showCropper && tempImageBase64 && (
                        <ImageCropper
                            imageSrc={tempImageBase64}
                            onComplete={handleCropComplete}
                            onCancel={() => setShowCropper(false)}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                className="border rounded-md p-2"
                                disabled={(date) => (startDate ? !(date >= startDate) : false)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                className="border rounded-md p-2"
                                disabled={(date) => (startDate ? !(date >= startDate) : false)}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full mt-2">
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin mr-2 h-4 w-4" /> Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </form>
            </Form>
        </FormTemplate>
    );
}

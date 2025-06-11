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
import { updateEvent } from "@/actions/events"; // assume updateEvent exists
import { getErrorMessage } from "@/utils/helpers";
import { Loader } from "lucide-react";
import uploadImageToFirebase from "@/lib/uploadImageToFirebase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormTemplate from "./FormTemplate";

// Schema
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    location: z.string().min(1, "Location is required"),
    image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// @/types/event.ts
export interface EventDataType {
    id: string;
    title: string;
    tagline: string;
    description: string;
    location: string;
    image: string | null;
    createdBy: string;
    startDate: string | null;
    endDate: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export default function EventEditForm({ eventData }: { eventData: EventDataType }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: eventData?.title || "",
            tagline: eventData?.tagline || "",
            location: eventData?.location || "",
            image: null,
        },
    });

    const [description, setDescription] = useState(eventData?.description || "");
    const [imagePreview, setImagePreview] = useState(eventData?.image || "");
    const [startDate, setStartDate] = useState<Date | undefined>(
        eventData?.startDate ? new Date(eventData.startDate) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        eventData?.endDate ? new Date(eventData.endDate) : undefined
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);

        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates.");
            setIsLoading(false);
            return;
        }

        if (endDate < startDate) {
            toast.error("End date must be after start date.");
            setIsLoading(false);
            return;
        }

        try {
            const imageFile = values.image;
            let imageUrl = eventData.image || "https://dummyimage.com/600x400/000/fff";

            // Upload new image if selected
            if (imageFile instanceof File) {
                // const uploadResult = await uploadImageToFirebase(imageFile);
                // if (!uploadResult.success) {
                //     toast.error("Image upload failed: " + uploadResult.message);
                //     setIsLoading(false);
                //     return;
                // }
                // imageUrl = uploadResult?.data?.url || "";
            }

            const updatedData = {
                ...eventData,
                ...values,
                image: imageUrl,
                description,
                startDate,
                endDate,
            };

            const response = await updateEvent(updatedData); // update action

            if (response.success) {
                router.push(`/dashboard/events/${eventData?.id}`)
                toast.success("Event updated successfully!");
            } else {
                toast.error("Update failed: " + response.message);
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormTemplate title="Update Event Form" description="Modify your Event details">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            className="mt-2"
                            style={{ borderRadius: "5px", overflow: "hidden" }}
                            textareaProps={{ placeholder: "Briefly describe your event" }}
                            previewOptions={{ disallowedElements: ["style"] }}
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
                                        width={100}
                                        height={100}
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 rounded-md w-full h-auto max-h-64 object-contain"
                                    />
                                )}
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <Label>Select Event Dates</Label>
                        <div className="border rounded-md p-4 bg-muted">
                            <Calendar
                                mode="range"
                                selected={{
                                    from: startDate,
                                    to: endDate,
                                }}
                                onSelect={(range) => {
                                    setStartDate(range?.from);
                                    setEndDate(range?.to);
                                }}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                From <strong>{startDate?.toLocaleDateString() || "—"}</strong> to{" "}
                                <strong>{endDate?.toLocaleDateString() || "—"}</strong>
                            </p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Updating...
                            </>
                        ) : (
                            "Update Event"
                        )}
                    </Button>
                </form>
            </Form>
        </FormTemplate>
    );
}

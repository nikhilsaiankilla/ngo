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
import uploadImageToFirebase from "@/lib/uploadImageToFirebase";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";

// Define schema
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    location: z.string().min(1, "Location is required"),
    image: z.any(),
});

// Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

export default function EventUploadForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            tagline: "",
            location: "",
            image: null,
        },
    });

    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        if (!startDate || !endDate) {
            setIsLoading(false)
            toast.error("Please select both start and end dates.");
            return;
        }

        if (endDate < startDate) {
            setIsLoading(false)
            toast.error("End date must be after start date.");
            return;
        }

        let imageUrl = ""

        try {
            TODO:// we have to fix this later IMAGE UPLOAD PROBLEM
            if (image) {
                // const res = await uploadImageToFirebase(image);

                // if (!res.success) {
                //     toast.error(res?.message);
                //     return;
                // }

                // if (!res?.data?.url) {
                //     toast.error("something went wrong while uploading");
                //     return;
                // }

                imageUrl = "https://dummyimage.com/600x400/000/fff" //|| res?.data?.url ||
            } else {
                toast.error("Image is required.");
                setIsLoading(false)
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
                setIsLoading(false)
            }
            setIsLoading(false)
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
        }
        setIsLoading(false)
    };

    return (
        <Card className="max-w-2xl mx-auto mt-12 shadow-xl border rounded-2xl bg-white dark:bg-zinc-900">
            <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold">Create Event</h2>
                <p className="text-sm text-muted-foreground">Fill in the details to publish your event</p>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
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
                                style={{ borderRadius: 5, overflow: "hidden" }}
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
            </CardContent>
        </Card>
    );
}

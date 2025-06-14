"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Loader } from "lucide-react";

import { addService } from "@/actions/services";
import { getErrorMessage } from "@/utils/helpers";
import Image from "next/image";
import FormTemplate from "./FormTemplate";
import { uploadImageToCloudinary } from "@/lib/uploadImageToCloudinary";
import ImageCropper from "../ImageCropper";

// Schema
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ServiceForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageBase64, setTempImageBase64] = useState<string | null>(null);
    const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            tagline: "",
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
        setIsLoading(true);

        if (!description.trim()) {
            toast.error("Description is required.");
            setIsLoading(false);
            return;
        }

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

            const payload = {
                title: values.title,
                tagline: values.tagline,
                description,
                image: imageUrl,
            };

            const response = await addService(payload);

            if (response.success) {
                toast.success("Service added successfully!");
                form.reset();
                setDescription("");
                setImagePreview("");
            } else {
                toast.error("Failed to add service: " + response.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormTemplate title="Add Service Form" description="Add your service details">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Service title" {...field} disabled={isLoading} />
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

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Markdown)</Label>
                        <MDEditor
                            value={description}
                            onChange={(val) => setDescription(val || "")}
                            preview="edit"
                            height={300}
                            style={{ borderRadius: 5, overflow: "hidden" }}
                            textareaProps={{ placeholder: "Write your service details" }}
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
                                        src={imagePreview}
                                        alt="Preview"
                                        width={100}
                                        height={100}
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

                    <Button type="submit" disabled={isLoading} className="w-full mt-2">
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin mr-2 h-4 w-4" /> Creating...
                            </>
                        ) : (
                            "Add Service"
                        )}
                    </Button>
                </form>
            </Form>
        </FormTemplate>
    );
}

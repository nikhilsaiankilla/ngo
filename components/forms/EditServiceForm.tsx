"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";

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

import { Loader } from "lucide-react";
import uploadImageToFirebase from "@/lib/uploadImageToFirebase";
import { updateService } from "@/actions/services"; // adjust if needed
import { getErrorMessage } from "@/utils/helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormTemplate from "./FormTemplate";

// Schema
const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface serviceDataType {
    id: string,
    title: string,
    tagline: string,
    description: string,
    image: string,
    createdBy: string,
    createdAt?: string,
    updatedAt?: string,
}

export default function EditServiceForm({ serviceData }: { serviceData: serviceDataType }) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState(serviceData?.description || "");
    const [imagePreview, setImagePreview] = useState(serviceData?.image || "");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: serviceData?.title || "",
            tagline: serviceData?.tagline || "",
            image: null,
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);

        try {
            let imageUrl = serviceData.image || "https://dummyimage.com/600x400/000/fff";

            if (values.image instanceof File) {
                // const uploadResult = await uploadImageToFirebase(values.image);
                // if (!uploadResult.success) {
                //     toast.error("Image upload failed: " + uploadResult.message);
                //     setIsLoading(false);
                //     return;
                // }
                // imageUrl = uploadResult?.data?.url || "";
            }

            const updatedService = {
                id: serviceData.id,
                title: values.title,
                tagline: values.tagline,
                description,
                image: imageUrl,
            };

            const response = await updateService(updatedService);

            if (response.success) {
                router.push(`/dashboard/services/${serviceData?.id}`)
                toast.success("Service updated successfully!");
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
        <FormTemplate title="Update Service Form" description="Modify your service details">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
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

                    {/* Tagline */}
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

                    {/* Markdown Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Markdown)</Label>
                        <MDEditor
                            value={description}
                            onChange={(val) => setDescription(val || "")}
                            preview="edit"
                            height={300}
                            className="mt-2"
                            style={{ borderRadius: "5px", overflow: "hidden" }}
                            textareaProps={{ placeholder: "Briefly describe your service" }}
                            previewOptions={{ disallowedElements: ["style"] }}
                        />
                    </div>

                    {/* Image Upload */}
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

                    {/* Submit Button */}
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Updating...
                            </>
                        ) : (
                            "Update Service"
                        )}
                    </Button>
                </form>
            </Form>
        </FormTemplate>
    );
}

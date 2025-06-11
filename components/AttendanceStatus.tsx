"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button"; // Assuming Shadcn UI Button component
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react"; // For loading spinner
import { Label } from "./ui/label";
import { fetchThePastEvent, saveAttendance } from "@/actions/events";
import { toast } from "sonner";

// Form schema
const formSchema = z.object({
    attendance: z.enum(["attended", "not_attended"], {
        required_error: "Please select an attendance status.",
    }),
});

interface Event {
    id: string;
    name: string;
    date: Date;
}

const AttendanceStatus = () => {
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            attendance: "not_attended",
        },
    });

    // Fetch the first past event
    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true);
            const res = await fetchThePastEvent();

            if (!res?.success) {
                toast.error(res?.message);
                setIsLoading(false);
                return;
            }

            const eventData = {
                id: res?.data?.id,
                date: res?.data?.date,
                name: res?.data?.name,
            }

            setEvent(eventData);
            setIsLoading(false);
            console.log(res);
        };

        fetchEvent();
    }, []);

    // Form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!event) {
            toast.error("No event selected.");
            return;
        }

        try {
            const res = await saveAttendance(event.id, data.attendance);
            if (!res.success) {
                toast.error(res.message);
                return;
            }
            toast.success(res.message);
            // Optionally reset form or refetch event
            form.reset();
            setEvent(null); // Clear event to trigger refetch or show "no events" state
        } catch (error) {
            toast.error("Failed to save attendance status.");
        }
    };

    return (
        <Card className="mx-auto max-w-md shadow-sm border border-gray-200">
            <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Past Event Attendance
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                    {isLoading ? (
                        <span className="animate-pulse">Loading event...</span>
                    ) : event ? (
                        `Did you attend ${event.name}?`
                    ) : (
                        "No past events found to confirm attendance."
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {isLoading ? (
                    <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : event ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="attendance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Attendance Status
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="attended"
                                                        id="attended"
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <Label
                                                        htmlFor="attended"
                                                        className="text-sm text-gray-600 cursor-pointer"
                                                    >
                                                        Attended
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="not_attended"
                                                        id="not_attended"
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <Label
                                                        htmlFor="not_attended"
                                                        className="text-sm text-gray-600 cursor-pointer"
                                                    >
                                                        Not Attended
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all duration-200"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Attendance"
                                )}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <p className="text-sm text-gray-500 text-center">
                        No past events available to confirm.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceStatus;
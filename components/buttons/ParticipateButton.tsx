"use client";
import {
    checkUserParticipation,
    handleEventParticipate,
    handleCancelParticipation,
} from "@/actions/events";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type ParticipateButtonProps = {
    event: {
        id: string;
    };
};

export default function ParticipateButton({ event }: ParticipateButtonProps) {
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        const fetchParticipation = async () => {
            const res = await checkUserParticipation(event?.id);
            if (res?.success && res?.isParticipant) {
                setJoined(true);
            }
        };

        fetchParticipation();
    }, [event?.id]);

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await handleEventParticipate(event?.id);

            if (!res?.success) {
                toast.error(res?.message);
                return;
            }

            toast.success("You’ve successfully joined the event!");
            setJoined(true);
        } catch (err) {
            console.error("Error joining event:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const res = await handleCancelParticipation(event?.id);

            if (!res?.success) {
                toast.error(res?.message);
                return;
            }

            toast.success("You’ve canceled your participation.");
            setJoined(false);
        } catch (err) {
            console.error("Error cancelling participation:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            {!joined ? (
                <Button
                    onClick={handleClick}
                    disabled={loading}
                    className="p-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-700 bg-transparent hover:text-white disabled:opacity-50"
                >
                    {loading ? "Joining..." : "I want to participate"}
                </Button>
            ) : (
                <>
                    <Button
                        disabled
                        className="p-2 border-2 border-green-600 text-green-600 bg-green-100 rounded"
                    >
                        Participating
                    </Button>
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        className="p-2 border-2 border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white cursor-pointer rounded disabled:opacity-50"
                    >
                        {loading ? "Cancelling..." : "Cancel Participation"}
                    </Button>
                </>
            )}
        </div>
    );
}

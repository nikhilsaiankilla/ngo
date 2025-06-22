"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/helpers";
import { acceptRoleRequest, rejectRoleRequest } from "@/actions/requestRoleUpgrade";
import { RoleRequest } from "@/types";

interface Props {
    request: RoleRequest;
}

export const StatusCell: React.FC<Props> = ({ request }) => {
    const [status, setStatus] = useState(request.status);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rejectFeedback, setRejectFeedback] = useState("");

    const handleAccept = async () => {
        try {

            const req = await acceptRoleRequest({
                targetUserId: request.userId,
                requestedRole: request.requestedRole,
                currentRole: request.currentRole,
            });

            if (!req?.success) {
                toast.error(req?.message || "Something went wrong")
                return;
            }

            setStatus("accepted");
        } catch (error) {
            toast.error(getErrorMessage(error));
            return;
        }
    };

    const handleSubmitReject = async () => {
        try {
            const res = await rejectRoleRequest({
                targetUserId: request.userId,
                requestedRole: request.requestedRole,
                currentRole: request.currentRole,
                rejectReason: rejectFeedback,
            });

            if (!res.success) {
                toast.error(res.message || "Something went wrong");
                return;
            }

            setStatus("rejected");
            toast.success("Request rejected successfully");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsDialogOpen(false);
            setRejectFeedback("");
        }
    };


    if (status !== "pending") {
        return (
            <span className={status === "accepted" ? "text-green-600" : "text-red-600"}>
                {status}
            </span>
        );
    }

    return (
        <>
            <Button onClick={handleAccept} variant="outline" className="mr-2 bg-green-500">
                Accept
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
                        Reject
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Role Request</DialogTitle>
                        <DialogDescription>Provide a reason for rejection.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        className="mt-2"
                        placeholder="Reason"
                        value={rejectFeedback}
                        onChange={(e) => setRejectFeedback(e.target.value)}
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSubmitReject}
                            disabled={!rejectFeedback.trim()}
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

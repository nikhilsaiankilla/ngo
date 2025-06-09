"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

export interface RoleRequestHistory {
    userId: string;
    name: string;
    message: string;
    currentRole: string;
    requestedRole: string;
    status: "accepted" | "rejected";
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
}

export const columns: ColumnDef<RoleRequestHistory>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "message",
        header: "Message",
    },
    {
        accessorKey: "currentRole",
        header: "Current Role",
    },
    {
        accessorKey: "requestedRole",
        header: "Requested Role",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "rejectionReason",
        header: "Rejection Reason",
        cell: ({ getValue }) => {
            const text = getValue<string>();
            if (!text) return null;
            const truncated = text.length > 40 ? text.slice(0, 40) + "..." : text;
            return <span title={text}>{truncated}</span>;
        },
    },
    {
        accessorKey: "reviewedAt",
        header: "Reviewed At",
        cell: ({ getValue }) => {
            const dateStr = getValue<string>();
            if (!dateStr) return "-";

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "-";

            return date.toLocaleString();
        },
    },
];
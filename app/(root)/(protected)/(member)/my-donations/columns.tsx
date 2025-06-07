"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

export interface UserDonation {
    amount: number;
    method?: string | null;
    status: string;
    reason?: string | null;
    timestamp: string;
    notes?: Record<string, any>;
}

export const columns: ColumnDef<UserDonation>[] = [
    {
        accessorKey: "amount",
        header: "Amount (INR)",
        cell: ({ getValue }) => `₹${getValue<number>().toFixed(2)}`,
    },
    {
        accessorKey: "method",
        header: "Payment Method",
        cell: ({ getValue }) => getValue<string>()?.toUpperCase() || "-",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue<string>();
            const color =
                status === "success" ? "green" : status === "failed" ? "red" : "gray";
            return <span style={{ color }}>{status.toUpperCase()}</span>;
        },
    },
    {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => getValue<string>() || "-",
    },
    {
        accessorKey: "timestamp",
        header: "Date",
        cell: ({ getValue }) => {
            const dateStr = getValue<string>();
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "-";
            return date.toLocaleString();
        },
    },
    {
        accessorKey: "notes.notes",
        header: "Notes",
        cell: ({ row }) => {
            const notes = row.original.notes?.notes;
            if (!notes) return "-";
            const text = String(notes);
            const truncated = text.length > 40 ? text.slice(0, 40) + "..." : text;
            return <span title={text}>{truncated}</span>;
        },
    },
];

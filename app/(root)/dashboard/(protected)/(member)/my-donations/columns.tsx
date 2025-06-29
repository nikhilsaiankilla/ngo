"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";

export interface Payment {
    razorpay_payment_id: string;
    captured: boolean;
    method: string;
    status: string;
    timestamp: string;
    amount: number;
    invoice_url: string,
}

// Define columns for the payments table
export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "razorpay_payment_id",
        header: "Payment ID",
    },
    {
        accessorKey: "amount",
        header: "Amount (INR)",
        cell: ({ getValue }) => {
            const amount = getValue<number>();
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
            }).format(amount);
        },
    },
    {
        accessorKey: "captured",
        header: "Captured",
        cell: ({ getValue }) => {
            const captured = getValue<boolean>();
            return captured ? "Yes" : "No";
        },
    },
    {
        accessorKey: "method",
        header: "Method",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue<string>();
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            let statusClass = "";

            switch (status.toLowerCase()) {
                case "success":
                    statusClass = "bg-green-100 text-green-800";
                    break;
                case "failed":
                    statusClass = "bg-red-100 text-red-800";
                    break;
                case "pending":
                    statusClass = "bg-yellow-100 text-yellow-800";
                    break;
                default:
                    statusClass = "bg-gray-100 text-gray-800";
            }

            return (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                >
                    {formattedStatus}
                </span>
            );
        },
    },
    {
        accessorKey: "timestamp",
        header: "Time",
    },
    {
        accessorKey: "invoice_url",
        header: "Invoice",
        cell: ({ getValue }) => {
            const url = getValue<string>();

            if (!url) return "-";

            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline space-x-1"
                    download
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                </a>
            );
        },
    }
];
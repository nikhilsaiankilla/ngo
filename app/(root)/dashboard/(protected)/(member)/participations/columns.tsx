"use client";

import { ColumnDef } from "@tanstack/react-table";

// Interface for Event Attendance row
export interface EventAttendance {
    eventTitle: string;
    eventDate: string; // ISO string or Date
    attended: "attended" | "not_attended" | "not_confirmed";
    confirmedAt: string | null;
}

// Table column definitions
export const attendanceColumns: ColumnDef<EventAttendance>[] = [
    {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "eventTitle",
        header: "Event Title",
    },
    {
        accessorKey: "eventDate",
        header: "Event Date",
        cell: ({ getValue }) => {
            const date = new Date(getValue<string>());
            return date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        },
    },
    {
        accessorKey: "attended",
        header: "Attendance",
        cell: ({ getValue }) => {
            const value = getValue<"attended" | "not_attended" | "not_confirmed">();

            let label = "";
            let style = "";

            switch (value) {
                case "attended":
                    label = "Attended";
                    style = "bg-green-100 text-green-800";
                    break;
                case "not_attended":
                    label = "Not Attended";
                    style = "bg-red-100 text-red-800";
                    break;
                case "not_confirmed":
                    label = "Not Confirmed";
                    style = "bg-yellow-100 text-yellow-800";
                    break;
                default:
                    label = "Unknown";
                    style = "bg-gray-100 text-gray-800";
                    break;
            }

            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
                    {label}
                </span>
            );
        },
    },
    {
        accessorKey: "confirmedAt",
        header: "Confirmed On",
        cell: ({ getValue }) => {
            const value = getValue<string | null>();
            if (!value) return "—";
            const date = new Date(value);
            return date.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
            });
        },
    },
];

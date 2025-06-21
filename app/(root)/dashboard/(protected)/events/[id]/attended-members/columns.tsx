"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Users } from "./page";

export const columns: ColumnDef<Users>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => {
            const name = getValue<string>();
            return name || "-";
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => {
            const email = getValue<string>();
            return email || "-";
        },
    },
    {
        accessorKey: "attended",
        header: "Attended",
        cell: ({ getValue }) => {
            const status = getValue<string>();

            const isConfirmed = status === "confirmed";

            return (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${isConfirmed
                            ? "bg-success text-white"
                            : "bg-warn text-white"
                        }`}
                >
                    {isConfirmed ? "Confirmed" : "Not Confirmed"}
                </span>
            );
        },
    },
];

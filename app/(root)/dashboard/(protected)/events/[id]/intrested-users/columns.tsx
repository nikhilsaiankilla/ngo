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
        accessorKey: "joinedAt",
        header: "Joined At",
    },
];

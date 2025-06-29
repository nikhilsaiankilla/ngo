"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StatusCell } from "@/components/StatusCell";
import { RoleRequest } from "@/types";

export const columns: ColumnDef<RoleRequest>[] = [
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
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell request={row.original} />,
    },
];

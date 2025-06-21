"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { debounce } from "@/lib/utils";
import { findUserByNameOrEmail, manageMemberRole } from "@/actions/manageMember";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import Image from "next/image";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/helpers";

type Role = "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE";

type User = {
    id: string;
    name: string;
    email: string;
    user_type: Role;
    photoURL?: string;
};

const roleOrder: Role[] = ["REGULAR", "MEMBER", "TRUSTIE", "UPPER_TRUSTIE"];

const ManageMembers = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchItem, setSearchItem] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<Role | undefined>();
    const [reviewNote, setReviewNote] = useState("");
    const [isRoleChanging, setIsRoleChanging] = useState(false);

    const debouncedCheckUser = useCallback(
        debounce(async (searchTerm: string) => {
            if (!searchTerm.trim()) {
                setUsers([]);
                return;
            }

            setIsLoading(true);
            const res = await findUserByNameOrEmail(searchTerm);

            if (res.success && res?.data) {
                setUsers(res.data);
            } else {
                setUsers([]);
            }

            setIsLoading(false);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedCheckUser(searchItem);
    }, [searchItem]);

    const getNextRoles = (currentRole: Role): Role[] => {
        const index = roleOrder.indexOf(currentRole);
        const nextRoles: Role[] = [];
        if (index > 0) nextRoles.push(roleOrder[index - 1]);
        if (index < roleOrder.length - 1) nextRoles.push(roleOrder[index + 1]);
        return nextRoles;
    };

    const handleOpenDialog = (user: User) => {
        setSelectedUser(user);
        setNewRole(undefined);
        setReviewNote("");
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !newRole || !reviewNote.trim()) return;

        setIsRoleChanging(true);

        try {
            const res = await manageMemberRole(selectedUser.id, selectedUser.user_type, newRole, reviewNote);

            if (!res?.success) {
                toast.error(res?.message);
            } else {
                toast.success(res?.message);
                setSelectedUser(null); // ✅ close dialog
                setSearchItem(""); // Optional: clear input after change
                setUsers([]);      // Optional: reset list
            }
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        }

        setIsRoleChanging(false);
    };

    const isPromotion =
        selectedUser && newRole
            ? roleOrder.indexOf(newRole) > roleOrder.indexOf(selectedUser.user_type)
            : false;

    return (
        <div className="w-full space-y-6 mb-12">
            <div className="space-y-2">
                <Label htmlFor="searchTerm" className="text-lg font-semibold text-gray-800">
                    Search Users
                </Label>
                <Input
                    id="searchTerm"
                    placeholder="Enter name or email..."
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    required
                    className="py-2 text-base rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {isLoading && (
                <p className="text-sm w-full text-muted text-center gap-3 flex items-center">
                    <Loader size={22} className="animate-spin" /> Searching users...
                </p>
            )}

            {!isLoading && users.length <= 0 && searchItem && (
                <p className="text-sm text-muted text-center mt-5">
                    No users found matching that term.
                </p>
            )}

            {!isLoading && users.length > 0 && (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center gap-4">
                                {user.photoURL && (
                                    <Image
                                        src={user.photoURL}
                                        width={100}
                                        height={100}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                                    {user.user_type}
                                </span>
                                <Button
                                    variant="outline"
                                    className="text-sm"
                                    onClick={() => handleOpenDialog(user)}
                                >
                                    Manage Member
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Manage Member Role</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {selectedUser.photoURL && (
                                    <Image
                                        width={100}
                                        height={100}
                                        src={selectedUser.photoURL}
                                        alt={selectedUser.name}
                                        className="w-12 h-12 rounded-full border object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold">{selectedUser.name}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    <p className="text-xs mt-1 text-gray-400">
                                        Current role: {selectedUser.user_type}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="block mb-1 text-sm">Select New Role</Label>
                                <Select value={newRole} onValueChange={(val) => setNewRole(val as Role)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getNextRoles(selectedUser.user_type).map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block mb-1 text-sm">Review/Reason</Label>
                                <textarea
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
                                    rows={4}
                                    placeholder="Why are you promoting/demoting this user?"
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleRoleChange}
                                disabled={isRoleChanging}
                                className={isPromotion ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                {isRoleChanging ? (
                                    <> <Loader className="animate-spin mr-2 h-4 w-4" /> upgrading..</>
                                ) : isPromotion ? "Promote" : "Demote"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ManageMembers;

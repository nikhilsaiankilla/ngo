"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import Image from 'next/image'
import { LogOutIcon, Trash2Icon } from 'lucide-react'
import { getUserForUi, userSignOut } from '@/actions/auth';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string,
    name: string,
    email: string,
    image: string
}

const ProfileDropDown = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserForUi();

            if (!res.success) {
                toast.error(res?.message)
                return;
            }

            setUser({
                id: res?.data?.id || "",
                name: res?.data?.name,
                email: res?.data?.email,
                image: res?.data?.image
            })
        }
        fetchUser();
    }, [])

    // Memoize user data to prevent unnecessary re-renders
    const memoizedUser = useMemo(() => user, [user]);

    const handleSignout = async () => {
        // Implement signout logic here
        try {
            await signOut(auth);
            await userSignOut();

            router.push('/')
            toast.success('user signout successfully')
        } catch (error) {
            toast?.error('something went wrong while logging out')
            console.log(error);
        }
    }

    const handleDeleteAccount = () => {
        // Implement account deletion logic here
        toast.error("Account deletion not implemented yet");
    }

    return (
        <SidebarGroup className="mt-auto">
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton >
                                <Link className="flex items-center gap-2 font-normal text-sm border-3 rounded-lg p-5 cursor-pointer" href='/dashboard/profile'>
                                    <Image
                                        src={memoizedUser?.image || "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png"}
                                        alt="User avatar"
                                        width={34}
                                        height={34}
                                        className="rounded-full"
                                    />
                                    <div className='flex flex-col items-start justify-start pl-3'>
                                        <span className="text-sm font-medium">{memoizedUser?.name}</span>
                                        <span className="text-xs text-muted-foreground">{memoizedUser?.email}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="end" className="w-56">
                            <div className='w-full flex items-center justify-start gap-2 px-3'>
                                <Image
                                    src={memoizedUser?.image || "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png"}
                                    alt="User avatar"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <DropdownMenuLabel className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">{memoizedUser?.name}</span>
                                    <span className="text-xs text-muted-foreground">{memoizedUser?.email}</span>
                                </DropdownMenuLabel>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant='destructive'
                                onClick={handleSignout}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <LogOutIcon className="size-4" />
                                <span>Signout</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant='destructive'
                                onClick={handleDeleteAccount}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2Icon className="size-4" />
                                <span>Delete Account</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default ProfileDropDown
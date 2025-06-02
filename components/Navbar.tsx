'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Events', href: '/events' },
        { label: 'Donate', href: '/donate' },
        { label: 'Services', href: '/services' },
        { label: 'Login', href: '/auth/signin' },
        { label: 'About', href: '/about' },
    ];

    return (
        <nav className="w-full border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Site Name / Logo */}
                    <div className="flex-shrink-0 text-xl font-bold text-green-700 cursor-pointer">
                        NGO Site {/* replace this with your logo or site name */}
                    </div>

                    {/* Right: Nav Links */}
                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-6">
                            {navItems.map(({ label, href }) => {
                                const isActive = pathname === href;
                                const isDonate = label.toLowerCase() === 'donate';

                                return (
                                    <NavigationMenuItem key={href}>
                                        <NavigationMenuLink
                                            asChild
                                            className={`relative px-2 py-1 rounded-md font-medium transition-colors
                        ${isDonate
                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                    : 'text-gray-700 hover:text-green-600'
                                                }
                        ${isActive && !isDonate ? 'underline underline-offset-4 decoration-2 decoration-green-600' : ''}
                      `}
                                        >
                                            <Link href={href}>{label}</Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                );
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </nav>
    );
}

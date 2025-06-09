"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Define navigation items
    const navItems = [
        { label: "Home", href: "/" },
        { label: "Events", href: "/events" },
        { label: "Services", href: "/services" },
        { label: "Login", href: "/auth/signin" },
        { label: "Donate", href: "/dashboard/donate" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm py-4 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-gray-900">
                    Hussani Welfare
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                    {navItems.map(({ label, href }) => {
                        const isActive = pathname === href;
                        const isDonate = label.toLowerCase() === "donate";

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`transition-colors duration-200 ${isDonate
                                        ? "bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
                                        : isActive
                                            ? "text-green-600 font-semibold"
                                            : "hover:text-green-600"
                                    }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 fixed inset-x-0 top-16 animate-slide-in">
                    <div className="px-6 py-4 space-y-3">
                        {navItems.map(({ label, href }) => {
                            const isActive = pathname === href;
                            const isDonate = label.toLowerCase() === "donate";

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`block text-base font-medium transition-colors duration-200 ${isDonate
                                            ? "bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
                                            : isActive
                                                ? "text-green-600 font-semibold"
                                                : "text-gray-700 hover:text-green-600"
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
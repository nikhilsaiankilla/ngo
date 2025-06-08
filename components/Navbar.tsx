'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useRouter } from 'next/navigation';
import { userSignOut } from '@/actions/auth';

// Define User interface
interface UserData {
    id: string;
    name?: string;
    user_type?: 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data on auth state change
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUser({
                            id: firebaseUser.uid,
                            name: userDoc.data().name || firebaseUser.displayName || 'User',
                            user_type: userDoc.data().user_type || 'REGULAR',
                        });
                    } else {
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            user_type: 'REGULAR',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle body overflow when dropdown or mobile menu is open
    useEffect(() => {
        if (isDropdownOpen || isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDropdownOpen, isMobileMenuOpen]);

    // Logout handler
    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            await userSignOut();
            setUser(null);
            setIsMobileMenuOpen(false);
            setIsDropdownOpen(false);
            router.push('/auth/signin');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Define nav items based on auth and role
    const navItems = [
        { label: 'Events', href: '/events' },
        { label: 'Donate', href: '/donate' },
        { label: 'Services', href: '/services' },
        ...(user
            ? [
                { label: 'Dashboard', href: '/dashboard' },
                ...(user.user_type === 'TRUSTIE' || user.user_type === 'UPPER_TRUSTIE'
                    ? [{ label: 'Manage Events', href: '/events/manage' }]
                    : []),
                ...(user.user_type === 'UPPER_TRUSTIE'
                    ? [{ label: 'Admin', href: '/admin/dashboard' }]
                    : []),
            ]
            : [{ label: 'Login', href: '/auth/signin' }]),
        { label: 'About', href: '/about' },
    ];

    if (isLoading) {
        return (
            <nav className="w-full bg-white sticky top-0 z-[1000]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-2xl font-bold text-green-700">NGO Site</span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-full bg-white sticky top-0 z-[1000]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo / Site Name */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-green-700">NGO Site</span>
                            {/* Replace with logo image if available */}
                            {/* <img src="/logo.png" alt="NGO Logo" className="h-8 w-auto" /> */}
                        </Link>
                    </div>

                    {/* Right: Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavigationMenu>
                            <NavigationMenuList className="flex space-x-2">
                                {navItems.map(({ label, href }) => {
                                    const isActive = pathname === href;
                                    const isDonate = label.toLowerCase() === 'donate';

                                    return (
                                        <NavigationMenuItem key={href}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={href}
                                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                            ${isDonate
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                                        }
                            ${isActive && !isDonate
                                                            ? 'text-green-600 border-b-2 border-green-600'
                                                            : ''
                                                        }`}
                                                    aria-current={isActive ? 'page' : undefined}
                                                >
                                                    {label}
                                                </Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    );
                                })}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* User Profile Dropdown */}
                        {user && (
                            <DropdownMenu
                                open={isDropdownOpen}
                                onOpenChange={setIsDropdownOpen}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600"
                                        aria-label="User menu"
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="hidden sm:inline">{user.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48 z-[1001] mt-2 bg-white shadow-lg border border-gray-200"
                                    style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
                                >
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/profile/${user.id}`}
                                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    {(user.user_type === 'MEMBER' ||
                                        user.user_type === 'TRUSTIE' ||
                                        user.user_type === 'UPPER_TRUSTIE') && (
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/my-donations"
                                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    My Donations
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 z-[1001] fixed inset-x-0 top-16">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map(({ label, href }) => {
                            const isActive = pathname === href;
                            const isDonate = label.toLowerCase() === 'donate';

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium
                    ${isDonate
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                        }
                    ${isActive && !isDonate
                                            ? 'text-green-600 bg-green-50'
                                            : ''
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                        {user && (
                            <>
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                {(user.user_type === 'MEMBER' ||
                                    user.user_type === 'TRUSTIE' ||
                                    user.user_type === 'UPPER_TRUSTIE') && (
                                        <Link
                                            href="/my-donations"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            My Donations
                                        </Link>
                                    )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
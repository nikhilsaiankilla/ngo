'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Heart, Menu, Phone, X } from 'lucide-react';
import Image from 'next/image';
import CustomBtn from './buttons/CustomBtn';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Events', href: '/events' },
        { label: 'Services', href: '/services' },
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'Login', href: '/auth/signin' },
    ];

    return (
        <nav className='w-full py-4 px-6 sm:px-8 z-50 relative'>
            <div className='flex justify-between items-center w-full mx-auto'>
                {/* Logo */}
                <Link href='/' className='flex items-center space-x-3'>
                    <Image
                        src='/logo.png'
                        alt='Hussaini Welfare Organisation'
                        width={50}
                        height={50}
                        priority
                    />
                    <div className='flex flex-col leading-tight'>
                        <span className='text-lg md:text-xl font-bold tracking-tight text-brand'>
                            Hussaini Welfare
                        </span>
                        <span className='text-sm font-medium text-soft'>Organisation</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className='hidden lg:flex items-center gap-6 text-sm font-medium'>
                    {navItems.map(({ label, href }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative transition-all duration-300 group ${isActive
                                    ? 'text-brand font-semibold'
                                    : 'text-dark hover:text-brand hover:scale-105'
                                    }`}
                            >
                                {label}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isActive
                                        ? 'w-full bg-brand'
                                        : 'w-0 group-hover:w-full bg-brand'
                                        }`}
                                />
                            </Link>
                        );
                    })}
                </div>

                {/* Contact + Donate (Desktop only) */}
                <div className='hidden lg:flex items-center gap-5'>
                    <span className='flex items-center gap-2 text-xs font-semibold text-dark'>
                        <Phone size={14} className='text-warn' />
                        +91 99999 99999
                    </span>
                    <CustomBtn label='Donate' icon={<Heart size={18} />} href='/donate' />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className='lg:hidden text-dark focus:outline-none focus:ring-2 focus:ring-warn rounded-md p-1'
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label='Toggle mobile menu'
                >
                    {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            <div
                className={`lg:hidden fixed inset-x-0 top-16 bg-light glass border-t border-white/20 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100 max-h-screen' : '-translate-y-full opacity-0 max-h-0'
                    } overflow-hidden z-40`}
            >
                <div className='px-6 py-6 space-y-4 flex flex-col'>
                    {navItems.map(({ label, href }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative transition-all duration-300 group ${isActive
                                    ? 'text-brand font-semibold'
                                    : 'text-dark hover:text-brand hover:scale-105'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {label}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isActive
                                        ? 'w-full bg-brand'
                                        : 'w-0 group-hover:w-full bg-warn'
                                        }`}
                                />
                            </Link>
                        );
                    })}
                </div>

                {/* Contact + Donate (Mobile) */}
                <div className='flex flex-col items-center gap-4 px-6 pb-6'>
                    <span className='flex items-center gap-2 text-xs font-semibold text-dark'>
                        <Phone size={14} className='text-warn' />
                        +91 99999 99999
                    </span>
                    <CustomBtn label='Donate' icon={<Heart size={18} />} href='/donate' />
                </div>
            </div>
        </nav>
    );
}

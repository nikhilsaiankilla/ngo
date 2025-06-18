'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Heart, icons } from 'lucide-react';

type DonateBtnProps = {
    label?: string;
    href?: string;
    icon?: ReactNode;
    variant?: 'warn' | 'brand';
};

const CustomBtn: React.FC<DonateBtnProps> = ({
    label = 'Donate',
    href = '/donate',
    icon = <Heart />,
    variant = 'warn',
}) => {
    const bgColor = variant === 'warn' ? 'bg-warn hover:bg-brand' : 'bg-brand hover:bg-warn';
    const textColor = 'text-white';

    return (
        <Link
            href={href}
            className={`relative w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${bgColor} ${textColor} font-semibold shadow-md transition-all duration-300 ease-in-out group overflow-hidden`}
        >
            <span className='absolute inset-0 rounded-2xl bg-glow opacity-20 blur-md group-hover:opacity-40 group-hover:blur-lg transition duration-300 z-0'></span>

            <span>{icon}</span>
            <span className='z-10'>{label}</span>
        </Link>
    );
};

export default CustomBtn;

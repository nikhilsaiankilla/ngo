'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

const formatCompactAmount = (amount: number): string => {
    if (amount >= 10000000) return `${Math.floor(amount / 10000000)}Cr+`;
    if (amount >= 100000) return `${Math.floor(amount / 100000)}L+`;
    if (amount >= 1000) return `${Math.floor(amount / 1000)}K+`;
    return `₹${amount}`;
};

const TotalDonationCard = () => {
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTotal = async () => {
            try {
                const res = await fetch('/api/total-donations', { next: { revalidate: 60 } });
                const data = await res.json();

                if (!data?.success) {
                    return toast.error(data?.message || 'Failed to fetch donation data');
                }

                setTotalAmount(data?.data || 0);
            } catch (err) {
                console.error('Fetch error:', err);
                toast.error('Something went wrong while fetching donation stats');
            } finally {
                setLoading(false);
            }
        };

        fetchTotal();
    }, []);

    return (
        <Card className="rounded-2xl border border-[#F97316] bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Wallet size={20} className="text-warn" />
                        Total Donations
                    </CardTitle>
                </div>

                <CardDescription className="text-sm text-muted mb-4">
                    This is the total amount contributed since launching online.
                </CardDescription>

                {loading ? (
                    <Skeleton className="h-8 w-32 rounded-md bg-warn/50" />
                ) : (
                    <p className="text-3xl font-extrabold text-warn tracking-tight">
                        {formatCompactAmount(totalAmount)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default TotalDonationCard;

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Wallet } from 'lucide-react';
import { getTotalDonationsTillNow } from '@/actions/analytics';
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
                const res = await getTotalDonationsTillNow();

                if(!res?.success){
                    return toast.error(res?.message)
                }

                setTotalAmount(res?.data)
            } catch (err) {
                console.error('Failed to fetch total donations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTotal();
    }, []);

    console.log(totalAmount);
    

    return (
        <Card className="p-4 shadow-md rounded-2xl">
            <CardTitle className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Wallet size={22} /> Total Donations Collected
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mb-4">
                Since going live with online deployment
            </CardDescription>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-32 rounded-md bg-green-200" />
                ) : (
                    <p className="text-3xl font-bold text-green-700">
                        {formatCompactAmount(totalAmount || 0)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default TotalDonationCard;

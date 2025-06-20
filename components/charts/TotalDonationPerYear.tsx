import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { Wallet } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const formatCompactAmount = (amount: number): string => {
    if (amount >= 10000000) return `${Math.floor(amount / 10000000)}Cr+`;
    if (amount >= 100000) return `${Math.floor(amount / 100000)}L+`;
    if (amount >= 1000) return `${Math.floor(amount / 1000)}K+`;
    return `₹${amount}`;
};

const TotalDonationPerYear = ({
    totalAmount,
    loading,
    year,
}: {
    totalAmount: number;
    loading: boolean;
    year: number;
}) => {
    return (
        <Card className="rounded-2xl border border-[#F97316] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 w-full max-w-sm">
            <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-warn shrink-0" />
                    <CardTitle className="text-base md:text-lg font-semibold text-gray-800 truncate">
                        Annual Donations
                    </CardTitle>
                </div>

                <CardDescription className="text-sm text-muted leading-relaxed break-words">
                    Total donations collected in <strong>{year}</strong> since going live online.
                </CardDescription>

                {loading ? (
                    <Skeleton className="h-8 w-32 rounded-md bg-warn/50" />
                ) : (
                    <p className="text-3xl font-bold text-warn truncate max-w-full break-words">
                        {formatCompactAmount(totalAmount)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default TotalDonationPerYear;

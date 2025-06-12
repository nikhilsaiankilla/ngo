import React from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Wallet } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

const formatCompactAmount = (amount: number): string => {
    if (amount >= 10000000) return `${Math.floor(amount / 10000000)}Cr+`;
    if (amount >= 100000) return `${Math.floor(amount / 100000)}L+`;
    if (amount >= 1000) return `${Math.floor(amount / 1000)}K+`;
    return `₹${amount}`;
};

const TotalDonationPerYear = ({ totalAmount, loading, year }: { totalAmount: number, loading: boolean, year: number }) => {
    return (
        <Card className="p-4 shadow-md rounded-2xl">
            <CardTitle className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Wallet size={22} /> Annual Donations Collected
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mb-4">
                Total donations collected in {year} since online deployment
            </CardDescription>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-32 rounded-md bg-green-200" />
                ) : (
                    <p className="text-3xl font-bold text-green-700">
                        {formatCompactAmount(totalAmount)}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default TotalDonationPerYear
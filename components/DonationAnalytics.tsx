"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import DonationsPerYear from "./charts/DonationsPerYear";
import TotalDonationCard from "./TotalDonationCard";
import { Label } from "./ui/label";

const DonationAnalytics = () => {
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );

    const years = Array.from({ length: 6 }, (_, i) => 2025 - i);

    return (
        <div className="w-full">
            {/* Section Heading */}
            <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                    <Wallet size={24} /> Donation Analytics
                </h2>

                {/* Year Selector */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                        Year:
                    </Label>
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(Number(value))}
                    >
                        <SelectTrigger
                            id="year-select"
                            className="w-28 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>


            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DonationsPerYear selectedYear={selectedYear} />

                <div className="w-full grid grid-cols-2 gap-3">
                    <TotalDonationCard />
                    <TotalDonationCard />
                    <TotalDonationCard />
                    <TotalDonationCard />
                </div>
            </div>
        </div>
    );
};

export default DonationAnalytics;

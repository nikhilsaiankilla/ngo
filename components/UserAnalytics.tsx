"use client";

import React, { useState } from "react";
import { Card } from "./ui/card";
import UserGrowthOtherThenRegular from "./charts/UserGrowthOtherThenRegular";
import UpperTrustieGrowthChart from "./charts/UpperTrustieGrowthChart";
import TrustieGrowthChart from "./charts/TrustieGrowthChart";
import MemberGrowthChart from "./charts/MemberGrowthChart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { LineChart } from "lucide-react";
import UserTypeDistribution from "./charts/UserTypeDistribution";

const UserAnalytics = () => {
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );

    const years = Array.from({ length: 6 }, (_, i) => 2025 - i);

    return (
        <div className="w-full">
            {/* Section Heading */}
            <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                    <LineChart size={30} /> User Analytics
                </h2>

                {/* Year Selector */}
                <div className="flex items-center gap-2">
                    <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                        Year:
                    </label>
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
                <UserGrowthOtherThenRegular selectedYear={selectedYear} />
                <UpperTrustieGrowthChart selectedYear={selectedYear} />
                <TrustieGrowthChart selectedYear={selectedYear} />
                <MemberGrowthChart selectedYear={selectedYear} />
            </div>

            <div className="mt-5">
                <UserTypeDistribution selectedYear={selectedYear} />
            </div>
        </div>
    );
};

export default UserAnalytics;

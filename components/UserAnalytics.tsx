"use client";

import React, { useState } from "react";
import { LineChart } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

import UserGrowthOtherThenRegular from "./charts/UserGrowthOtherThenRegular";
import UpperTrustieGrowthChart from "./charts/UpperTrustieGrowthChart";
import TrustieGrowthChart from "./charts/TrustieGrowthChart";
import MemberGrowthChart from "./charts/MemberGrowthChart";
import UserTypeDistribution from "./charts/UserTypeDistribution";

const UserAnalytics = () => {
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );
    const years = Array.from({ length: 6 }, (_, i) => 2025 - i);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <LineChart size={24} className="text-primary" />
                    User Analytics
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    <label
                        htmlFor="year-select"
                        className="text-sm font-medium text-gray-700"
                    >
                        Select Year:
                    </label>
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(Number(value))}
                    >
                        <SelectTrigger
                            id="year-select"
                            className="w-28 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <SelectValue placeholder="Year" />
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

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserGrowthOtherThenRegular selectedYear={selectedYear} />
                <UpperTrustieGrowthChart selectedYear={selectedYear} />
                <TrustieGrowthChart selectedYear={selectedYear} />
                <MemberGrowthChart selectedYear={selectedYear} />
            </div>

            {/* Donut / Distribution */}
            <div className="pb-10">
                <UserTypeDistribution selectedYear={selectedYear} />
            </div>
        </div>
    );
};

export default UserAnalytics;

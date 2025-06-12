"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { getUserGrowthByType } from "@/actions/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface GrowthData {
    month: string;
    count: number;
}

export default function UpperTrustieGrowthChart() {
    const [data, setData] = useState<GrowthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Default to 2025

    // Generate years (e.g., 2025 to 2020)
    const years = Array.from({ length: 6 }, (_, i) => 2025 - i); // [2025, 2024, 2023, 2022, 2021, 2020]

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const growthData = await getUserGrowthByType(selectedYear, "UPPER_TRUSTIE");

                if (!growthData?.success || !growthData.data) {
                    setData([]);
                    return;
                }

                setData(growthData.data);
            } catch (err: unknown) {
                console.log(err);
                setError("Failed to load Upper Trustie growth data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedYear]);

    if (error) return <p className="text-red-500">{error}</p>;

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.month),
        datasets: [
            {
                label: `Upper Trustie Growth in ${selectedYear}`,
                data: data.map((d) => d.count),
                borderColor: "rgb(99, 102, 241)", // Indigo-500
                backgroundColor: "rgba(99, 102, 241, 0.5)",
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: `Upper Trustie Growth (${selectedYear})`,
            },
        },
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <label htmlFor="year-select" className="text-gray-700">
                    Select Year:
                </label>
                <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                >
                    <SelectTrigger id="year-select" className="w-32">
                        <SelectValue placeholder="Select year" />
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
            <Line options={options} data={chartData} />
        </div>
    );
}
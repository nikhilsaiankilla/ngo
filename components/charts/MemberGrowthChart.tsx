"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

import { getUserGrowthByType } from "@/actions/analytics";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart";

interface GrowthData {
    month: string; // format: "2024-01"
    count: number;
}

const chartConfig = {
    count: {
        label: "Users",
        color: "var(--chart-1)",
    },
};

export default function MemberGrowthChart({
    selectedYear,
}: {
    selectedYear: number;
}) {
    const [data, setData] = useState<GrowthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const res = await getUserGrowthByType(selectedYear, "MEMBER");
                if (!res.success || !res.data) {
                    setData([]);
                    return;
                }
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load user growth data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedYear]);

    const formatMonth = (monthKey: string) => {
        const [year, monthStr] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(monthStr) - 1);
        return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    };

    const formattedChartData = data.map((d) => ({
        month: formatMonth(d.month),
        count: d.count,
    }));

    if (error) return <p className="text-red-500">{error}</p>;

    if (loading) {
        return (
            <Card className="p-5">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-[#F97316] border-2">
            <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>{`January - December ${selectedYear}`}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedChartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    name="Month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={10}
                                    tickFormatter={(value) => value}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Line
                                    dataKey="count"
                                    type="monotone"
                                    stroke="var(--color-count)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

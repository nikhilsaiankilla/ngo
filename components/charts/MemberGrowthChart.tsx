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

export default function MemberGrowthChart({ year }: { year: number }) {
    const [data, setData] = useState<GrowthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Call your server action
                const growthData = await getUserGrowthByType(year, "MEMBER");

                if (!growthData?.success || !growthData.data) {
                    setData([]); // fallback to empty array to avoid error
                    return;
                }

                setData(growthData.data);
            } catch (err: unknown) {
                console.log(err);
                setError("Failed to load member growth data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [year]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    const chartData = {
        labels: data.map((d) => d.month),
        datasets: [
            {
                label: `Members Growth in ${year}`,
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
                text: `Member Growth (${year})`,
            },
        },
    };

    return <Line options={options} data={chartData} />;
}

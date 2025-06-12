"use client"

import { TrendingUp } from "lucide-react"
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getUserGrowth } from "@/actions/analytics"

interface GrowthData {
    month: string // format: "2024-01"
    count: number
}

const chartConfig = {
    count: {
        label: "Users",
        color: "var(--chart-1)",
    },
}

export default function UserGrowthOtherThanRegular({ selectedYear }: { selectedYear: number }) {
    const [data, setData] = useState<GrowthData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                setError(null)
                const res = await getUserGrowth(selectedYear)
                if (!res.success || !res.data) {
                    setData([])
                    return
                }
                setData(res.data)
            } catch (err) {
                console.error(err)
                setError("Failed to load user growth data.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedYear])

    const formatMonth = (monthKey: string) => {
        const [year, monthStr] = monthKey.split("-")
        const date = new Date(parseInt(year), parseInt(monthStr) - 1)
        return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
    }

    const formattedChartData = data.map((d) => ({
        month: formatMonth(d.month),
        count: d.count,
    }))

    if (error) return <p className="text-red-500">{error}</p>

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
        <Card>
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>{`January - December ${selectedYear}`}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={formattedChartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
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
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing non-regular user growth for {selectedYear}
                </div>
            </CardFooter>
        </Card>
    )
}

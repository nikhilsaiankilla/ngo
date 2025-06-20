"use client"

import React from 'react'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '../ui/chart'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '../ui/card'
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis
} from 'recharts'

interface DonationData {
    month: string
    total: number
    count: number
}

interface Props {
    data: DonationData[]
    loading: boolean
    selectedYear: number
}

const chartConfig = {
    desktop: {
        label: "Total Donations",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const DonationsPerLineChart = ({ data, loading, selectedYear }: Props) => {
    if (loading) {
        return (
            <Card className="p-5">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="border-[#F97316] border-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Donations Overview Line Chart</CardTitle>
                        <CardDescription>Monthly totals in {selectedYear}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        data={data}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="total"
                            type="linear"
                            stroke={chartConfig.desktop.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default DonationsPerLineChart

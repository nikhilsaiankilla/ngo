"use client"

import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '../ui/card'
import { getUserTypeCounts } from '@/actions/analytics'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '../ui/chart'
import { Label, Pie, PieChart, Cell } from 'recharts'

type UserTypeDistributionTypes = {
    userType: string
    count: number
}

const chartConfig = {
    REGULAR: { label: "Regular", color: "var(--chart-1)" },
    MEMBER: { label: "Member", color: "var(--chart-2)" },
    TRUSTIE: { label: "Trustie", color: "var(--chart-3)" },
    UPPER_TRUSTIE: { label: "Upper Trustie", color: "var(--chart-4)" },
} satisfies ChartConfig

export const description = "A donut chart with text"

const UserTypeDistribution = ({ selectedYear }: { selectedYear: number }) => {
    const [data, setData] = useState<UserTypeDistributionTypes[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                setError(null)
                const res = await getUserTypeCounts(selectedYear)

                if (!res.success || !res.data) {
                    setData([])
                    return
                }

                // Ensure all types are represented even if count is 0
                const userTypes = ["REGULAR", "MEMBER", "TRUSTIE", "UPPER_TRUSTIE"]
                const normalizedData = userTypes.map(type => {
                    const found = res.data.find((item: UserTypeDistributionTypes) => item.userType === type)
                    return {
                        userType: type,
                        count: found?.count || 0,
                    }
                })

                setData(normalizedData)
            } catch (err) {
                console.error(err)
                setError("Failed to load user growth data.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedYear])

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
        )
    }

    return (
        <Card className="border-[#F97316] border-2">
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>{`January - December ${selectedYear}`}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="userType"
                            innerRadius={60}
                            outerRadius={90}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={chartConfig[entry.userType as keyof typeof chartConfig]?.color || "#ccc"}
                                />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    const total = data.reduce((acc, item) => acc + item.count, 0)
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {total.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Users
                                                </tspan>
                                            </text>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default UserTypeDistribution

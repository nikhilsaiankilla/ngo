"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDonationsByYear } from "@/actions/analytics"; // Adjust if in different path

interface DonationData {
  month: string;
  total: number;
  count: number;
}

const chartConfig = {
  desktop: {
    label: "Total Donations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const DonationsPerYear = ({ selectedYear }: { selectedYear: number }) => {
  const currentYear = new Date().getFullYear();

  const [data, setData] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await getDonationsByYear(selectedYear);
        if (response.success && response.data) {
          // Transform to show month name instead of YYYY-MM
          const monthsMap = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const formattedData = response.data.map((entry: DonationData) => {
            const [year, month] = entry.month.split("-");
            return {
              ...entry,
              month: monthsMap[parseInt(month, 10) - 1],
            };
          });

          setData(formattedData.slice(0, 12)); // Show Jan–Jun like before
        } else {
          setData([]);
          setError("No data available.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch donation data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedYear]);


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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Donations Overview</CardTitle>
            <CardDescription>Monthly totals in {selectedYear}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="total" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DonationsPerYear;

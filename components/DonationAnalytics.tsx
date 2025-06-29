"use client";

import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import DonationsPerYear from "./charts/DonationsPerYear";
import TotalDonationCard from "./TotalDonationCard";
import { Label } from "./ui/label";
import { getDonationsByYear } from "@/actions/analytics";
import { toast } from "sonner";
import TotalDonationPerYear from "./charts/TotalDonationPerYear";
import DonationsPerLineChart from "./charts/DonationsPerLineChart";
import DonationsThisMonthCard from "./DonationsThisMonthCard";

interface DonationData {
    month: string;
    total: number;
    count: number;
}

const DonationAnalytics = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [data, setData] = useState<DonationData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [thisMonthDonations, setThisMonthDonations] = useState<number>(0);

    const years = Array.from({ length: 6 }, (_, i) => 2025 - i);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await getDonationsByYear(selectedYear);
                if (!res.success || !res?.data) {
                    toast.error("Something went wrong");
                    setData([]);
                    return;
                }

                const monthsMap = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                ];

                const formattedData = res.data.results.map((entry: DonationData) => {
                    const [, month] = entry.month.split("-");
                    return {
                        ...entry,
                        month: monthsMap[parseInt(month, 10) - 1],
                    };
                });

                const currentMonth = monthsMap[new Date().getMonth()];
                const currentMonthData = formattedData.find(entry => entry.month === currentMonth);

                setThisMonthDonations(currentMonthData?.total || 0);
                setData(formattedData);
                setTotalAmount(res.data.totalAmountThisYear);
            } catch (err) {
                console.error(err);
                setData([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedYear]);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                    <Wallet size={26} /> Donation Analytics
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
                <DonationsPerYear selectedYear={selectedYear} data={data} loading={loading} />

                <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <TotalDonationCard />
                        <TotalDonationPerYear
                            loading={loading}
                            totalAmount={totalAmount}
                            year={selectedYear}
                        />
                    </div>
                    <DonationsThisMonthCard loading={loading} totalAmount={thisMonthDonations} />
                </div>
            </div>

            <div className="pb-10">
                {/* Line Chart */}
                <DonationsPerLineChart
                    selectedYear={selectedYear}
                    data={data}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default DonationAnalytics;

"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
import { Download, Loader2 } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadDonations } from "@/actions/donations";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 2 }, (_, i) => (currentYear - i).toString());

const DownloadDonations = () => {
    const [year, setYear] = useState<number>(currentYear);
    const [loading, setLoading] = useState<boolean>(false);

    const handleDownload = async () => {
        if (!year) {
            toast.error("Select a year to download donations");
            return;
        }

        setLoading(true);

        try {
            const donations = await downloadDonations(year);

            if (!donations.data?.length) {
                toast.warning("No donations found for the selected year");
                setLoading(false);
                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // === Header Section ===
            const logoWidth = 30;
            const logoHeight = 30;
            const logoUrl = "/logo.png"; // make sure logo is in /public/logo.png

            const image = new window.Image();
            image.src = logoUrl;

            await new Promise((resolve) => {
                image.onload = () => {
                    doc.addImage(image, "PNG", 15, 10, logoWidth, logoHeight);
                    resolve(true);
                };
            });

            // Organization Name
            doc.setFontSize(16);
            doc.text("Hussaini Welfare Association", pageWidth - 15, 15, {
                align: "right",
            });

            // Dummy Name and Email
            doc.setFontSize(12);
            doc.text("Name: John Doe", pageWidth - 15, 22, { align: "right" });
            doc.text("Email: john@example.com", pageWidth - 15, 28, {
                align: "right",
            });

            // Title
            doc.setFontSize(14);
            doc.text(`Donation Report – ${year}`, pageWidth / 2, 45, {
                align: "center",
            });

            // Table
            autoTable(doc, {
                startY: 50,
                head: [
                    [
                        "S.No",
                        "Payment ID",
                        "Amount",
                        "Method",
                        "Status",
                        "Date & Time",
                        "Invoice",
                    ],
                ],
                body: donations.data.map((d, i) => [
                    i + 1,
                    d.razorpay_payment_id,
                    Number(d.amount).toLocaleString("en-IN"),
                    d.method,
                    d.status,
                    d.timestamp,
                    "Get Invoice",
                    d.invoice_url,
                ]),
                columnStyles: {
                    6: { cellWidth: 40 },
                },
                theme: "striped",
                headStyles: {
                    fillColor: [0, 123, 255],
                },
                didDrawCell(data: CellHookData) {
                    if (data.column.index === 6 && data.cell.raw === "Get Invoice") {
                        const rowData = data.row.raw as any[];
                        const invoiceUrl = rowData[7]; // 8th element is actual link
                        doc.setTextColor(0, 0, 255);
                        doc.textWithLink("Get Invoice", data.cell.x + 2, data.cell.y + 7, {
                            url: invoiceUrl,
                        });
                        doc.setTextColor(0, 0, 0); // reset text color
                    }
                },
            });

            // Footer
            const pageCount = (doc as any).getNumberOfPages?.() || 1;

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                );
            }

            doc.save(`donations-${year}.pdf`);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while generating the PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2 flex-wrap">
            <Select onValueChange={(val) => setYear(Number(val))}>
                <SelectTrigger className="w-[200px] flex items-center">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                onClick={handleDownload}
                className="bg-warn shadow-xl text-white"
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                {loading ? "Downloading.." : "Download Donations PDF"}
            </Button>
        </div>
    );
};

export default DownloadDonations;

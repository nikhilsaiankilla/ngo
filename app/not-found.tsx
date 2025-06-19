import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/sections/FooterSection";

export default function NotFoundPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-[90vh] flex items-center justify-center px-6 py-16">
                <div className="text-center max-w-xl space-y-6">
                    <div className="flex items-center justify-center text-warn">
                        <AlertTriangle size={48} className="text-warn" />
                    </div>

                    <h1 className="text-6xl font-extrabold text-warn">404</h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Oops! This page doesn't exist.
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                        The page you’re looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <Link
                        href="/"
                        className="inline-block bg-warn text-white font-medium py-2 px-6 rounded-full text-sm md:text-base hover:bg-orange-600 transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
            <FooterSection />
        </>
    );
}

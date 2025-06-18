import Navbar from "@/components/Navbar";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-light text-gray-800 font-sans">
            {/* Navbar */}
            <Navbar />
            {children}
        </div>
    );
}

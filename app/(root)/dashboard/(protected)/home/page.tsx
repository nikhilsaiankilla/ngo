import { cookies } from "next/headers";
import Link from "next/link";
import { adminDb } from "@/firebase/firebaseAdmin"; // Import Firestore admin
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn UI Card
import { Calendar, Users, Heart, Shield } from "lucide-react"; // Icons for sections
import { LucideIcon } from "lucide-react"; // Type for Lucide icons

// Define User type for clarity
interface User {
    id: string;
    user_type: "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE";
    name?: string; // Optional, assuming user might have a name
}

// Define Action type for role-based actions
interface Action {
    label: string;
    href: string;
    icon: LucideIcon; // Type for Lucide icons
}

const Page = async () => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const token = cookieStore.get("accessToken")?.value;

    // Check for userId and token
    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-red-500 text-2xl font-semibold">User ID not found</h1>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-red-500 text-2xl font-semibold">Token is missing</h1>
            </div>
        );
    }

    // Fetch user data to get user_type
    let user: User | null = null;
    try {
        const userDoc = await adminDb.doc(`users/${userId}`).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            user = {
                id: userId,
                user_type: data?.user_type || "REGULAR", // Default to REGULAR
                name: data?.name || "User",
            };
        } else {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <h1 className="text-red-500 text-2xl font-semibold">User not found</h1>
                </div>
            );
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-red-500 text-2xl font-semibold">Error fetching user data</h1>
            </div>
        );
    }

    // Define role-based actions with uppercase keys
    const roleActions: Record<User["user_type"], Action[]> = {
        REGULAR: [
            { label: "View Events", href: "/events", icon: Calendar },
            { label: "Support Our Cause", href: "/donate", icon: Heart },
        ],
        MEMBER: [
            { label: "View Events", href: "/events", icon: Calendar },
            { label: "Join Community", href: "/community", icon: Users },
            { label: "Support Our Cause", href: "/donate", icon: Heart },
        ],
        TRUSTIE: [
            { label: "Manage Events", href: "/events/manage", icon: Calendar },
            { label: "View Community", href: "/community", icon: Users },
            { label: "Support Our Cause", href: "/donate", icon: Heart },
        ],
        UPPER_TRUSTIE: [
            { label: "Manage Events", href: "/events/manage", icon: Calendar },
            { label: "Manage Users", href: "/admin/users", icon: Shield },
            { label: "View Dashboard", href: "/admin/dashboard", icon: Shield },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white py-6">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold">Welcome to [NGO Name]</h1>
                    <p className="mt-2 text-lg">
                        Hello, {user.name}! Together, we make a difference.
                    </p>
                    <div className="mt-4">
                        <Link href={`/profile/${userId}`}>
                            <Button className="bg-blue-400 hover:bg-blue-500 text-white">
                                Go to Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mission Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        At [NGO Name], we are dedicated to [mission statement, e.g., empowering communities, supporting education, or protecting the environment]. Join us in creating a brighter future.
                    </p>
                    <div className="mt-6">
                        <Link href="/about">
                            <Button
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                                Learn More About Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Role-Based Actions */}
            <section className="py-12 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
                        Your Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roleActions[user.user_type].map((action: Action, index: number) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <action.icon className="w-6 h-6 text-blue-600" />
                                        {action.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={action.href}>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            Go to {action.label}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-blue-600 text-white py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>© {new Date().getFullYear()} [NGO Name]. All rights reserved.</p>
                    <div className="mt-4 flex justify-center gap-4">
                        <Link href="/contact" className="hover:underline">
                            Contact Us
                        </Link>
                        <Link href="/privacy" className="hover:underline">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:underline">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Page;
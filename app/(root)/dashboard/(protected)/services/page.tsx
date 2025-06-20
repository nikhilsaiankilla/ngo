import CustomBtn from "@/components/buttons/CustomBtn";
import ServiceCard from "@/components/cards/ServiceCard";
import { adminDb } from "@/firebase/firebaseAdmin";
import { ArrowRight, HandHeart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const revalidate = 60;

export interface Service {
    id: string;
    createdAt?: string;
    createdBy: string;
    description: string;
    image: string;
    tagline: string;
    title: string;
    updatedAt?: string;
}

const getServices = async (): Promise<Service[]> => {
    const snapshot = await adminDb.collection("services").get();
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Service[];
};

const Page = async () => {

    let services = null;

    try {
        services = await getServices();
    } catch (error) {
        console.log(error);
    }
    return (
        <div className="min-h-screen mx-auto w-full max-w-7xl">
            {/* Hero */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-8 max-w-7xl mx-auto py-16">
                {/* Image Panel */}
                <div className="grid grid-cols-1 gap-5">
                    <Image
                        src="https://pehchaanstreetschool.org/wp-content/uploads/2021/03/IMG_20201108_155431_Bokeh-scaled.jpg"
                        alt="Event Preview 1"
                        width={100}
                        height={100}
                        className="object-cover w-full h-full aspect-video rounded-tr-3xl rounded-bl-3xl"
                        unoptimized
                    />
                </div>

                {/* Text Panel */}
                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2">
                        <HandHeart size={28} className="text-warn" />
                        <h3 className="text-warn text-xl font-semibold uppercase">Our Services</h3>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
                        Making Help Accessible, One Service at a Time.
                    </h1>
                    <p className="text-gray-700 text-base md:text-lg">
                        Discover the range of services we offer—from educational support to medical aid.
                    </p>
                    <p className="italic text-gray-500">
                        Your participation powers every act of change.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <CustomBtn label="Contribute To Our Services" href="/dashboard/donate" icon={<ArrowRight />} variant="warn" />
                    </div>
                </div>
            </div>

            {/* Services Listing */}
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Active Services</h2>
                    <p className="text-sm md:text-base text-gray-600">
                        From education to emergency aid, every service is built to create lasting change.
                    </p>
                </div>

                {services === null ? (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl text-red-600 font-bold">Error Fetching Services</h2>
                        <p className="text-gray-600">Something went wrong. Please try again later.</p>
                        <Link href="/" className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full">
                            Go Back Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {(services ?? []).map((s, i) => (
                            <ServiceCard service={s} key={s.id ?? i} isDashboard={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;

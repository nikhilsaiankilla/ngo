import React from "react";
import { adminDb } from "@/firebase/firebaseAdmin";
import Image from "next/image";

export const revalidate = 60; // Revalidate every 60 seconds

// Define the Service interface based on the provided data structure
interface Service {
    id: string;
    createdAt?: string; // e.g., "4 June 2025 at 20:56:41 UTC+5:30"
    createdBy: string; // e.g., "QWLpkwNHu3YeGaAKla43RJ6Q82w2"
    description: string; // e.g., "h"
    image: string; // e.g., URL
    tagline: string; // e.g., "Turning Ideas into Interactive Web Experiences..."
    title: string; // e.g., "updated service"
    updatedAt?: string; // e.g., "4 June 2025 at 21:18:01 UTC+5:30"
}

const getServices = async (): Promise<Service[]> => {
    const servicesSnapshot = await adminDb.collection("services").get();
    const services = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Service[];
    return services;
};

const Page = async () => {
    const services = await getServices();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Our Services</h1>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <div key={service.id} className="border p-4 rounded shadow">
                        <Image
                            src={service.image}
                            alt={service.title}
                            width={100}
                            height={100}
                            className="w-full h-48 object-cover rounded mb-2"
                        />
                        <h2 className="text-xl font-semibold">{service.title}</h2>
                        <p className="text-sm text-gray-500">{service.tagline}</p>
                        <p className="mt-2">{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
import SafeImage from "@/components/SafeImage";
import { Card, CardAction, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/firebase/firebaseAdmin";
import Link from "next/link";
import React from "react";

export const revalidate = 60;

interface Service {
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
  const services = await getServices();

  return (
    <div className="p-6 space-y-12 max-w-7xl mx-auto">
      <section>
        <h2 className="text-3xl font-bold mb-6">Our Services</h2>
        {services.length === 0 ? (
          <p className="text-gray-500">No services available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="rounded-2xl shadow-md overflow-hidden transition hover:shadow-xl p-4">
                <SafeImage
                  src={service.image}
                  alt={service.title}
                  width={500}
                  height={280}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <CardContent className="space-y-1 p-4">
                  <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                  <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                  <p className="text-sm mt-2">{service.description}</p>
                </CardContent>
                <CardAction>
                  <Link
                    href={`/services/${service.id}`}
                    className="inline-block bg-green-600 text-white font-medium py-2 px-4 rounded-full text-sm hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    View Details
                  </Link>
                </CardAction>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Page;

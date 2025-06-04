import React from "react";
import { adminDb } from "@/firebase/firebaseAdmin";

export const revalidate = 60; // Revalidate every 60 seconds

const getServices = async () => {
  const servicesSnapshot = await adminDb.collection("services").get();
  const services = servicesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return services;
};

const Page = async () => {
  const services = await getServices();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Our Services</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service: any) => (
          <div key={service.id} className="border p-4 rounded shadow">
            <img src={service.image} alt={service.title} className="w-full h-48 object-cover rounded mb-2" />
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

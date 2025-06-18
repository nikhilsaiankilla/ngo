import CustomBtn from "@/components/buttons/CustomBtn";
import ServiceCard from "@/components/cards/ServiceCard";
import SafeImage from "@/components/SafeImage";
import FooterSection from "@/components/sections/FooterSection";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { adminDb } from "@/firebase/firebaseAdmin";
import { Calendar, CalendarRange } from "lucide-react";
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
  let services: Service[] = [];
  let error = null;

  try {
    services = await getServices();
  } catch (err) {
    console.error("Error fetching services:", err);
    error = err;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Services Page */}
      <div
        className="relative w-full py-20 bg-cover bg-center px-6 sm:px-8"
        style={{ backgroundImage: "url('/donation.jpeg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand opacity-50 z-0" />

        {/* Content Wrapper */}
        <div className="relative z-10 h-full flex items-start justify-center">
          <div className="max-w-2xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar size={32} className="text-white" />
              <h3 className="text-xl font-bold uppercase tracking-wide">
                Our Services, Your Support
              </h3>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-warn">
              Making Impact Possible
            </h2>
            <p className="mt-4 text-sm md:text-base">
              From organizing medical camps to running free skill training programs,
              our services aim to uplift the underserved and build stronger communities.
            </p>
            <p className="mt-2 text-xs md:text-sm italic text-gray-100">
              Every service we offer is powered by the kindness of people like you.
            </p>

            <div className="mt-6">
              <CustomBtn
                label="Support Our Mission"
                href="/donate"
                icon={<CalendarRange />}
                variant="warn"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {error ? (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Fetching Events</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong while loading events. Please try again later.
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white font-medium py-2 px-6 rounded-full hover:bg-green-700 transition-all duration-200"
            >
              Go Back Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard service={service} key={index} />
              ))}
            </div>
          </>
        )}
      </div>

      <FooterSection />
    </div>
  );
};

export default Page;

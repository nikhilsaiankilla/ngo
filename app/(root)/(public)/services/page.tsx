import CustomBtn from "@/components/buttons/CustomBtn";
import ServiceCard from "@/components/cards/ServiceCard";
import FooterSection from "@/components/sections/FooterSection";

import { adminDb } from "@/firebase/firebaseAdmin";
import { ArrowRight, HandHeart, MessageCircle } from "lucide-react";
import Image from "next/image";
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
      <div className="w-[95%] mx-auto py-10 px-6 md:px-8 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-2xl">
        {/* Left: Headings + CTA */}
        <div className="space-y-6">
          <h3 className="text-warn font-semibold text-xl flex items-center gap-2">
            <HandHeart className="text-warn" size={28} />
            Our Services
          </h3>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Making Help Accessible, One Service at a Time.
          </h1>
          <p className="text-gray-700 text-base md:text-lg">
            Discover the range of services we offer—from educational support to medical aid. Our mission is simple: to uplift communities through consistent, compassionate action.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <CustomBtn
              label="Contribute To our Services"
              href="/donate"
              icon={<ArrowRight />}
              variant="warn"
            />
            <CustomBtn
              label="Contact Us"
              href="/contact-us"
              icon={<MessageCircle />}
              variant="brand"
            />
          </div>
        </div>

        {/* Right: Visual (icon grid or illustrative image) */}
        <div className="w-full flex justify-center items-center">
          <Image
            src="/service.png" // Use a meaningful custom illustration or icon cluster
            alt="Helping hands illustration"
            width={500}
            height={500}
            className="w-full aspect-square object-contain"
          />
        </div>

      </div>



      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        <h1 className="text-2xl font-bold">Our Services</h1>
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
                <ServiceCard service={service} key={index} isDashboard={false} />
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

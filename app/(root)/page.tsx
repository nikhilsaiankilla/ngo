import AboutSection from "@/components/sections/AboutSection";
import HeroSection from "@/components/sections/HeroSection";
import EventsSection from "@/components/sections/EventsSection";
import ImpactSection from "@/components/sections/ImpactSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import ServiceSection from "@/components/sections/ServiceSection";
import DonationSection from "@/components/sections/DonationSection";
import TeamSection from "@/components/sections/TeamSection";
import FooterSection from "@/components/sections/FooterSection";
import { HeartHandshake, Users } from "lucide-react";
import CustomBtn from "@/components/buttons/CustomBtn";
import Navbar from "@/components/Navbar";


export default function Home() {

  return (
    <>
      <Navbar />

      <HeroSection />

      <AboutSection />

      <ImpactSection />

      <ServiceSection />

      <DonationSection />

      <EventsSection />

      <section
        className="relative w-full h-96 bg-cover bg-center mt-20 overflow-hidden"
        style={{ backgroundImage: "url('/donation.jpeg')" }} // use a different image if possible
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand/90 via-warn/50 to-transparent z-0" />

        {/* Left-aligned Content */}
        <div className="absolute inset-0 z-10 flex items-center px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="text-left max-w-lg text-white">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake size={32} className="text-white" />
              <h3 className="text-xl font-bold uppercase tracking-wide">Become a Changemaker</h3>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-warn">We need people like you</h2>
            <p className="mt-4 text-sm md:text-base">
              Whether you're a student, working professional, or retiree — your time and energy can help us make a real impact on the ground.
            </p>

            <div className="mt-6">
              <CustomBtn label="Join the Team" href="/auth/signin" icon={<Users />} variant="warn" />
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <TestimonialSection />

      <FooterSection />
    </>
  );
}
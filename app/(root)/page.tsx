import AboutSection from "@/components/sections/AboutSection";
import HeroSection from "@/components/sections/HeroSection";
import EventsSection from "@/components/sections/EventsSection";
import ImpactSection from "@/components/sections/ImpactSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import ServiceSection from "@/components/sections/ServiceSection";
import DonationSection from "@/components/sections/DonationSection";
import TeamSection from "@/components/sections/TeamSection";


export default function Home() {

  return (
    <>
      <HeroSection />

      <AboutSection />

      <ImpactSection />

      <EventsSection />

      <DonationSection />

      <ServiceSection />

      <TestimonialSection />

      <TeamSection/>
    </>
  );
}
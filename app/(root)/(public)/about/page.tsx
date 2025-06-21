import CustomBtn from '@/components/buttons/CustomBtn';
import FooterSection from '@/components/sections/FooterSection';
import Image from 'next/image';
import React from 'react';
import {
  HeartHandshake,
  Eye,
  Users,
  HelpingHand,
  ArrowRight,
  Handshake,
  Heart,
} from 'lucide-react';
import ImpactSection from '@/components/sections/ImpactSection';
import TeamSection from '@/components/sections/TeamSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title : 'About Our Ngo'
}

const AboutPage = () => {
  const values = [
    {
      icon: <HeartHandshake size={28} className="text-brand" />,
      title: 'Compassion for All',
      description:
        'We treat every individual with dignity, kindness, and empathy.',
    },
    {
      icon: <Eye size={28} className="text-brand" />,
      title: 'Transparency & Trust',
      description:
        'We operate with honesty and clarity in all our actions and decisions.',
    },
    {
      icon: <Users size={28} className="text-brand" />,
      title: 'Unity & Collaboration',
      description:
        'We believe in the power of working together for greater impact.',
    },
    {
      icon: <HelpingHand size={28} className="text-brand" />,
      title: 'Service Before Self',
      description: 'Our mission is driven by purpose—not profit.',
    },
  ];

  return (
    <section className="w-full bg-light font-sans">
      <div className="max-w-7xl mx-auto w-full">

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-10 px-6 md:px-8">
          {/* Text */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-brand">Who Are We</h2>
            <h1 className="text-5xl font-extrabold text-dark leading-tight mt-2">
              Hussaini Welfare Association
            </h1>
            <p className="text-sm text-muted mt-4">
              Hussaini Welfare Association is a nonprofit, volunteer-led organization committed to uplifting underserved communities with compassion, dignity, and action. From education and healthcare to food security and emergency relief, we strive to create lasting impact in the lives of those who need it most.
            </p>
            <p className="text-sm text-muted mt-4">
              We believe that small acts of kindness can create powerful ripples. Our members — students, professionals, homemakers, retirees — are united by one mission: to serve humanity, selflessly and sustainably.
            </p>
            <blockquote className="text-muted italic text-sm mt-6 border-l-4 pl-4 border-warn">
              “Service to others is the rent you pay for your room here on earth.” — Muhammad Ali
            </blockquote>
            <div className="mt-6">
              <CustomBtn
                label="Join As Member"
                icon={<ArrowRight size={18} />}
                href="/auth/signin"
              />
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 aspect-square hidden lg:block">
            <Image
              src="/image2.png"
              alt="Indian map with children"
              width={100}
              height={100}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-10 px-6 md:px-8">

          {/* Image */}
          <div className="w-full aspect-square">
            <Image
              src="/image1.png" // update to an actual mission-related image
              alt="HWA volunteers serving food to the needy"
              width={100}
              height={100}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>

          {/* Text */}
          <div className="flex-1">
            {/* Mission Heading */}
            <h2 className="text-2xl font-bold text-brand">Our Mission</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark leading-tight mt-2">
              Serving with Dignity, Uplifting with Purpose
            </h1>

            <p className="text-sm text-muted mt-4">
              Our mission is simple yet powerful — to serve those in need with compassion, dignity, and urgency. We are committed to uplifting communities through initiatives like medical camps, food relief drives, educational sponsorships, and rapid emergency response.
            </p>
            <p className="text-sm text-muted mt-4">
              At Hussaini Welfare Association, we believe every human deserves a fair chance at life — and we exist to help make that a reality through direct action and collective care.
            </p>

            {/* Quote */}
            <blockquote className="text-muted italic text-sm mt-6 border-l-4 pl-4 border-warn">
              “The best way to find yourself is to lose yourself in the service of others.” — Mahatma Gandhi
            </blockquote>

            {/* Optional CTA – Keep if needed */}
            <div className="mt-6">
              <CustomBtn
                label="Support Our Mission"
                icon={<ArrowRight size={18} />}
                href="/donate"
              />
            </div>
          </div>
        </div>

        {/* History & Vision Section */}
        <div className="w-full bg-light py-14 px-6 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-center">

            {/* Left: History */}
            <div className='w-full'>
              <h2 className="text-2xl font-bold text-brand">Our Journey</h2>
              <h3 className="text-4xl font-extrabold text-dark mt-2">From Humble Beginnings to Hope in Action</h3>
              <p className="text-sm text-muted mt-4">
                Hussaini Welfare Association began as a small community initiative with a big heart. What started with a few volunteers distributing meals has now grown into a full-fledged movement impacting lives through education, healthcare, and emergency relief.
              </p>
              <p className="text-sm text-muted mt-4">
                Over the years, we’ve expanded our reach, organized hundreds of events, and partnered with changemakers who believe in the power of kindness and grassroots action.
              </p>
            </div>

            {/* Right: Vision */}
            <div className='w-full'>
              <h2 className="text-2xl font-bold text-brand">Our Vision</h2>
              <h3 className="text-4xl font-extrabold text-dark mt-2">A Just, Dignified, and Compassionate Society</h3>
              <p className="text-sm text-muted mt-4">
                We envision a world where no child is denied education, no family goes to bed hungry, and every person lives with dignity. Our vision is to build inclusive communities that uplift the vulnerable and celebrate unity in diversity.
              </p>

              <blockquote className="text-muted italic text-sm mt-6 border-l-4 pl-4 border-warn">
                “Alone we can do so little; together we can do so much.” — Helen Keller
              </blockquote>
            </div>
          </div>
        </div>

        <ImpactSection />

        <TeamSection />


        {/* Want to Help Section */}
        <section className="w-full bg-brand/5 py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand">
              Want to Help?
            </h2>
            <p className="text-sm md:text-base text-muted mt-3 max-w-2xl mx-auto">
              Every helping hand brings us closer to a just and compassionate society. Whether you're donating, volunteering, or partnering — you're making a difference that matters.
            </p>

            {/* Help Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto text-left">
              {/* Donate */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="text-warn" size={26} />
                  <h3 className="text-lg font-bold text-dark">Make a Donation</h3>
                </div>
                <p className="text-sm text-muted">
                  Support our ongoing efforts through a one-time or recurring donation. Every rupee fuels change.
                </p>
              </div>

              {/* Volunteer */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-brand" size={26} />
                  <h3 className="text-lg font-bold text-dark">Volunteer With Us</h3>
                </div>
                <p className="text-sm text-muted">
                  Offer your time, energy, and skills on the ground or remotely. There's a place for everyone here.
                </p>
              </div>

              {/* Partner */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <Handshake className="text-success" size={26} />
                  <h3 className="text-lg font-bold text-dark">Partner With Us</h3>
                </div>
                <p className="text-sm text-muted">
                  Collaborate with us on events, drives, or CSR initiatives. Together, we can do more.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <CustomBtn
                label="Join the Movement"
                href="/auth/signin"
                icon={<Users size={18} />}
              />
            </div>
          </div>
        </section>
      </div>

      <FooterSection />
    </section>
  );
};

export default AboutPage;

import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Uplifting Muslim Communities Together
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Empowering Muslim families through education, healthcare, and economic support.
          </p>
          <Link
            href="/dashboard/donate"
            className="inline-block bg-white text-green-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
          >
            Support Our Mission
          </Link>
        </div>
        <div className="absolute inset-0 bg-black opacity-10" />
      </section>

      {/* About Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At Muslim Welfare NGO, we are dedicated to fostering equality and opportunity for Muslim communities. Our programs focus on providing quality education, accessible healthcare, and economic empowerment to build stronger, self-reliant communities.
            </p>
            <Link
              href="/about"
              className="text-green-600 font-semibold hover:underline transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Image of Community Program</span>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Goals</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            By 2030, we aim to educate 5,000 children, provide healthcare to 10,000 families, and support 1,000 entrepreneurs in Muslim communities, fostering sustainable growth and dignity.
          </p>
          <Link
            href="/services"
            className="inline-block bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300"
          >
            Become a member
          </Link>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Voices of Impact</h2>
          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <p className="text-gray-600 italic text-lg mb-4">
              "Thanks to this NGO, my children now attend school, and our family has access to medical care. It’s a blessing for our community."
            </p>
            <p className="text-gray-800 font-semibold">— Aisha Khan, Beneficiary</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-green-600">2,000+</h3>
              <p className="text-gray-600">Children Educated</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-green-600">5,000+</h3>
              <p className="text-gray-600">Families Supported</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-green-600">500+</h3>
              <p className="text-gray-600">Jobs Created</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-800 text-gray-300 text-center text-sm">
        <p>© {new Date().getFullYear()} Muslim Welfare NGO. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/about" className="hover:text-green-400 transition-colors duration-200">
            About
          </Link>
          <Link href="/contact" className="hover:text-green-400 transition-colors duration-200">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-green-400 transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
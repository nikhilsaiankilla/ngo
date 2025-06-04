import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6 text-center text-green-700">
        About Us
      </h1>
      <p className="text-lg mb-4 text-gray-700">
        <strong>Hussaini Welfare Association</strong> is a non-profit organization committed to serving humanity with compassion and integrity. We bring people together to contribute towards social welfare through donations, volunteering, and active community participation.
      </p>
      <p className="text-lg mb-4 text-gray-700">
        Our work focuses on key areas such as organizing medical camps, offering free training programs, and conducting various community-driven events to uplift the underserved. Through our membership program, individuals can support and engage in these initiatives according to their affordability and interest.
      </p>
      <p className="text-lg mb-4 text-gray-700">
        We believe in transparency, accountability, and shared responsibility. Every member and donor becomes a vital part of the positive change we’re driving together.
      </p>
      <blockquote className="italic text-xl text-center text-gray-600 mt-8">
        “The best way to find yourself is to lose yourself in the service of others.” — Mahatma Gandhi
      </blockquote>
    </div>
  );
};

export default AboutPage;

import FooterSection from "@/components/sections/FooterSection";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn about how Hussaini Welfare collects, uses, and protects your personal data.',
    openGraph: {
        title: 'Privacy Policy - Hussaini Welfare',
        description: 'Learn about how Hussaini Welfare collects, uses, and protects your personal data.',
        url: 'https://yourdomain.com/privacy-policy',
        siteName: 'Hussaini Welfare',
        images: [
            {
                url: 'https://yourdomain.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Hussaini Welfare Privacy Policy',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy - Hussaini Welfare',
        description: 'Learn about how Hussaini Welfare collects, uses, and protects your personal data.',
        images: ['https://yourdomain.com/og-image.png'],
        creator: '@HussainiWelfare',
    },
};

// app/privacy-policy/page.tsx
export default function PrivacyPolicyPage() {
    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="mb-4 text-gray-700">Last updated: June 20, 2025</p>

                <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    <li>Personal info: name, email, donation details</li>
                    <li>Usage data: IP, browser type, pages visited</li>
                    <li>Voluntary input: feedback, contact forms</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    <li>Improve experience & features</li>
                    <li>Send updates (opt-in only)</li>
                    <li>Process donations securely</li>
                    <li>Detect and prevent misuse</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-2">3. Your Rights</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    <li>Access, update or delete your data</li>
                    <li>Withdraw consent anytime</li>
                    <li>Request data portability</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies</h2>
                <p className="text-gray-700">
                    We use cookies to enhance your experience. You can disable them in your browser settings.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact</h2>
                <p className="text-gray-700">
                    For privacy-related questions, reach out to us at{' '}
                    <a href="mailto:support@hussaini-welfare.org" className="underline text-blue-600">
                        support@hussaini-welfare.org
                    </a>.
                </p>
            </div>
            <FooterSection />
        </section>
    );
}

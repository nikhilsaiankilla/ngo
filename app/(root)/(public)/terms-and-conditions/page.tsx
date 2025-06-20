import FooterSection from "@/components/sections/FooterSection";

// app/terms-and-conditions/page.tsx
export default function TermsPage() {
    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
                <p className="mb-4 text-gray-700">Last updated: June 20, 2025</p>

                <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance</h2>
                <p className="text-gray-700">
                    By using our site, you agree to these terms and any updates we post.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Service</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    <li>Don’t misuse our platform or perform illegal activities.</li>
                    <li>You may not copy, redistribute, or sell any part of the service.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-2">3. Intellectual Property</h2>
                <p className="text-gray-700">
                    All content belongs to us unless stated otherwise. Don’t reproduce without permission.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">4. Donations</h2>
                <p className="text-gray-700">
                    Donations are voluntary and non-refundable unless clearly stated.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
                <p className="text-gray-700">
                    We are not liable for any damages arising from your use of the site.
                </p>
            </div>
            <FooterSection />
        </section>
    );
}

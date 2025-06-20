import FooterSection from "@/components/sections/FooterSection";

// app/faq/page.tsx
export default function FAQPage() {
    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">❓ What is this platform for?</h2>
                    <p className="text-gray-700">It's a donation-friendly platform built to help devs and creators grow through support and fun tools.</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">❓ Are donations mandatory?</h2>
                    <p className="text-gray-700">Not at all. All features are free. Donations help us improve and run this platform.</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">❓ Is my data safe?</h2>
                    <p className="text-gray-700">Yes. We don’t share or sell your data. Read our Privacy Policy for full details.</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">❓ How do I contact support?</h2>
                    <p className="text-gray-700">Email us at <a href="mailto:support@example.com" className="underline text-blue-600">support@example.com</a>.</p>
                </div>
            </div>
            <FooterSection />
        </section>
    );
}

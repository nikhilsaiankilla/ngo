import FooterSection from "@/components/sections/FooterSection";
import { Metadata } from 'next';

export const generateMetadata = (): Metadata => ({
    title: 'FAQ',
    description: 'Frequently Asked Questions about Hussaini Welfare and how we support our community.',
    openGraph: {
        title: 'FAQ - Hussaini Welfare',
        description: 'Frequently Asked Questions about Hussaini Welfare and how we support our community.',
        url: 'https://yourdomain.com/faq',
        siteName: 'Hussaini Welfare',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FAQ - Hussaini Welfare Association',
        description: 'Frequently Asked Questions about Hussaini Welfare and how we support our community.',
        creator: '@HussainiWelfare',
    },
});

const faqs = [
    {
        question: "❓ What is Hussaini Welfare?",
        answer: "Hussaini Welfare is a community-driven organization dedicated to providing support and aid to those in need.",
    },
    {
        question: "❓ How can I contribute or donate?",
        answer: "You can contribute by donating through our official channels or volunteering in our community projects.",
    },
    {
        question: "❓ Is my donation secure?",
        answer: "Yes. All donations are securely processed and directly used for welfare activities. Transparency reports are available upon request.",
    },
    {
        question: "❓ How can I get in touch for support?",
        answer: <>You can reach us at <a href="mailto:support@hussaini-welfare.org" className="underline text-blue-600">support@hussaini-welfare.org</a> or call us at +123-456-7890.</>,
    },
];

export default function FAQPage() {
    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
                {faqs.map(({ question, answer }, idx) => (
                    <div key={idx} className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">{question}</h2>
                        <p className="text-gray-700">{answer}</p>
                    </div>
                ))}
            </div>
            <FooterSection />
        </section>
    );
}

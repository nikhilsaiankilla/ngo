import SuccessClient from "@/components/SuccessClient";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: 'Donation Successful',
    description: 'Thank you for your generous donation to Hussaini Welfare Association. Your support helps us continue our community and charitable work.',
    keywords: [
        'donation success',
        'thank you for donating',
        'charity donation',
        'Hussaini Welfare Association',
        'support nonprofit',
        'donate success page'
    ],
    openGraph: {
        title: 'Donation Successful - Hussaini Welfare Association',
        description: 'Thank you for your generous donation to Hussaini Welfare Association. Your support helps us continue our community and charitable work.',
        url: 'https://yourdomain.com/donate/success',
        siteName: 'Hussaini Welfare Association',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Donation Successful - Hussaini Welfare Association',
        description: 'Thank you for your generous donation to Hussaini Welfare Association. Your support helps us continue our community and charitable work.',
        creator: '@yourTwitterHandle',
    },
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: 'https://yourdomain.com/donate/success',
    },
};


export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <SuccessClient />
        </Suspense>
    );
}
import PublicDonateForm from '@/components/forms/PublicDonateForm'
import FooterSection from '@/components/sections/FooterSection'
import { getCookiesFromServer } from '@/lib/serverUtils'
import { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'

export const metadata: Metadata = {
    title: 'Donate',
    description: 'Support Hussaini Welfare Association by making a donation. Your generosity helps us continue our community work and charitable activities.',
    keywords: [
        'donate',
        'charity',
        'Hussaini Welfare Association',
        'support community',
        'nonprofit donation',
        'give back',
        'help others',
        'fundraising',
        'charitable organization'
    ],
    openGraph: {
        title: 'Donate - Hussaini Welfare Association',
        description: 'Support Hussaini Welfare Association by making a donation. Your generosity helps us continue our community work and charitable activities.',
        url: 'https://yourdomain.com/donate',
        siteName: 'Hussaini Welfare Association',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Donate - Hussaini Welfare Association',
        description: 'Support Hussaini Welfare Association by making a donation. Your generosity helps us continue our community work and charitable activities.',
        creator: '@yourTwitterHandle',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://yourdomain.com/donate',
    },
};


const page = async () => {

    const { userId } = await getCookiesFromServer();

    if (userId) {
        return redirect('/dashboard/donate')
    }

    return (
        <section className="w-full bg-light font-sans">
            <div className="w-full min-h-[95vh] grid grid-cols-1 lg:grid-cols-2 items-center gap-5 max-w-7xl mx-auto px-6 md:px-8 py-10">
                <Image
                    alt="image"
                    src="/image1.png"
                    width={100}
                    unoptimized
                    height={100}
                    className="w-full object-contain hidden lg:block"
                />

                <div className="w-full flex flex-col justify-center space-y-8">
                    <PublicDonateForm />
                </div>
            </div >
            <FooterSection />
        </section>
    )
}

export default page
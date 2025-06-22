import ContactForm from '@/components/forms/ContactForm';
import FooterSection from '@/components/sections/FooterSection';
import Image from 'next/image';
import React from 'react';

export const metadata = {
    title: 'Contact Us',
    description: 'Reach out to Hussaini Welfare Association for inquiries, support, and community involvement. We are here to help you.',

    openGraph: {
        title: 'Contact Us - Hussaini Welfare Association',
        description: 'Reach out to Hussaini Welfare Association for inquiries, support, and community involvement. We are here to help you.',
        url: 'https://yourdomain.com/contact',
        siteName: 'Hussaini Welfare Association',
        locale: 'en_US',
        type: 'website',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Contact Us - Hussaini Welfare Association',
        description: 'Reach out to Hussaini Welfare Association for inquiries, support, and community involvement. We are here to help you.',
        creator: '@yourTwitterHandle', // Your twitter handle (optional)
    },

    robots: {
        index: true,
        follow: true,
    },

    alternates: {
        canonical: 'https://yourdomain.com/contact',
    },
};


const page = () => {
    return (
        <section className="w-full bg-light font-sans">
            <div className="w-full min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 items-center gap-5 max-w-7xl mx-auto px-6 md:px-8 py-10">
                <Image
                    alt="image"
                    src="/image1.png"
                    width={100}
                    unoptimized
                    height={100}
                    loading='lazy'
                    className="w-full object-contain hidden lg:block"
                />

                <div className="w-full flex flex-col justify-center items-center space-y-8">
                    <ContactForm />
                </div>
            </div >
            <FooterSection />
        </section>
    );
};

export default page;
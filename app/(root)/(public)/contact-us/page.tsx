import ContactForm from '@/components/forms/ContactForm';
import FooterSection from '@/components/sections/FooterSection';
import Image from 'next/image';
import React from 'react';

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
                    className="w-full object-contain hidden lg:block"
                />

                <div className="w-full flex flex-col justify-center items-center space-y-8">
                    <ContactForm />
                </div>
            </div >
            <FooterSection/>
        </section>
    );
};

export default page;
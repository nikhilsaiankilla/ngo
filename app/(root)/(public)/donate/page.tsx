import PublicDonateForm from '@/components/forms/PublicDonateForm'
import FooterSection from '@/components/sections/FooterSection'
import { cookies } from 'next/headers'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {

    const cookiesStore = await cookies();
    const userId = cookiesStore.get('userId');

    if(userId){
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
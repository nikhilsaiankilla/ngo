import { HeartHandshake } from 'lucide-react'
import React from 'react'
import DonateBtn from '../buttons/DonateBtn'

const DonationSection = () => {
    return (
        <section
            className="relative w-full h-96 bg-cover bg-center"
            style={{ backgroundImage: "url('/donation.jpeg')" }}
        >
            {/* Overlay with top and bottom gap */}
            <div className="absolute left-0 right-0 top-10 w-[90%] mx-auto bottom-10 bg-brand opacity-50 z-0" />

            {/* Content on top of overlay */}
            <div className="absolute left-0 right-0 top-10 bottom-10 z-10 flex items-center justify-center flex-col w-full max-w-7xl mx-auto gap-3 text-center px-4">
                <HeartHandshake size={70} className='text-warn'/>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Support Our Cause</h2>
                <p className="mt-4 text-white text-sm md:text-base max-w-2xl mx-auto">
                    Your small contribution can make a big difference. Join hands with Hussani Welfare Association to uplift lives.
                </p>
                <DonateBtn/>
            </div>
        </section>

    )
}

export default DonationSection
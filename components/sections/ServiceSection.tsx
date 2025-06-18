import { BookOpenTextIcon, GlassWater, Heart, Hospital, TrendingUpIcon } from 'lucide-react'
import React from 'react'
import CustomBtn from '../buttons/CustomBtn'

const ServiceSection = () => {
    return (
        <section className='py-22 bg-light flex items-center justify-center'>
            <div className='w-full md:w-7xl mx-auto px-6 sm:px-8'>
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">We Need Your Support</h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center max-w-2xl mx-auto">
                    Your Donation Means Another Smile
                </h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    Every rupee you donate helps us bring life-changing initiatives to communities in need — from clean water to education and healthcare. Be the reason someone smiles today.
                </p>

                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-10 gap-5'>

                    <div className="w-full border-4 border-gray-100 rounded-2xl p-4 py-20 flex flex-col items-center text-center gap-4 bg-transparent shadow-sm">
                        <div className="p-4 rounded-full bg-brand/10 border-3 border-[#1E3A8A]">
                            <BookOpenTextIcon size={48} className="text-brand" />
                        </div>
                        <h2 className="text-xl font-semibold text-dark">Kids' Education</h2>
                        <p className="text-sm text-dark max-w-xs">
                            Provide books, uniforms, and access to quality education for children in underserved communities.
                        </p>
                    </div>

                    <div className="w-full border-4 border-gray-100 rounded-2xl p-4 py-20 flex flex-col items-center text-center gap-4 bg-transparent shadow-sm">
                        <div className="p-4 rounded-full bg-brand/10 border-3 border-[#FCD34D]">
                            <GlassWater size={48} className="text-[#FCD34D]" />
                        </div>
                        <h2 className="text-xl font-semibold text-dark">Clean Water Access</h2>
                        <p className="text-sm max-w-xs text-dark">
                            Help us install safe and reliable drinking water facilities in remote villages and urban slums.
                        </p>
                    </div>

                    <div className="w-full border-4 border-gray-100 rounded-2xl p-4 py-20 flex flex-col items-center text-center gap-4 bg-transparent shadow-sm">
                        <div className="p-4 rounded-full bg-brand/10 border-3 border-green-400">
                            <TrendingUpIcon size={48} className="text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-dark">Livelihood Support</h2>
                        <p className="text-sm max-w-xs text-dark">
                            Empower families through vocational training, skill-building programs, and micro-grants.
                        </p>
                    </div>

                    <div className="w-full border-4 border-gray-100 rounded-2xl p-4 py-20 flex flex-col items-center text-center gap-4 bg-transparent shadow-sm">
                        <div className="p-4 rounded-full bg-brand/10 border-3 border-red-500">
                            <Hospital size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-dark">Medical Camps</h2>
                        <p className="text-sm max-w-xs text-dark">
                            Offer free check-ups, medicines, and health awareness drives in marginalized communities.
                        </p>
                    </div>

                </div>

                {/* CTA Section */}
                <div className="mt-12 w-full flex justify-center">
                    <CustomBtn
                        label="Join Our Mission"
                        href="/donate"
                        icon={<Heart className="w-4 h-4" />}
                    />
                </div>
            </div>
        </section>

    )
}

export default ServiceSection
import { ArrowRight, HeartHandshake, Target } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CustomBtn from '../buttons/CustomBtn'

const AboutSection = () => {
    return (
        <div className="w-full bg-light py-4 px-6 sm:px-8">
            <div className='w-full lg:w-7xl mx-auto flex justify-between flex-col-reverse lg:flex-row gap-5 mt-10'>
                <div className="w-full aspect-square relative">
                    <Image src='/about.png' alt="indian map with kids inside them" unoptimized width={100} height={100} className="w-full h-full object-contain" />
                </div>

                <div className='w-full flex justify-between flex-col mt-10'>
                    <div>
                        <h2 className='text-2xl font-bold text-brand'>Who We Are</h2>
                        <h1 className='text-5xl font-extrabold text-dark'>Hussaini Welfare Association</h1>
                    </div>

                    <p className='text-sm font-normal text-muted mt-4'>
                        Hussaini Welfare Association is a non-profit organization committed to serving humanity with compassion, integrity, and action. We believe in transforming lives by addressing core needs and creating lasting impact.
                    </p>

                    <p className='text-sm font-normal text-muted mt-4'>
                        Rooted in unity and purpose, we work across vital areas like education, healthcare, hunger relief, and crisis response—striving to build a fairer, kinder world for all.
                    </p>

                    <p className='text-sm font-normal text-muted mt-4'>
                        Our dedicated team, supported by generous volunteers and donors like you, is driven by the belief that small acts of kindness can spark profound change. Come, be part of this journey.
                    </p>

                    <div className='flex items-center justify-between flex-col md:flex-row mt-5 gap-4'>
                        <div className='flex items-center justify-center gap-3'>
                            <span className='aspect-square rounded-full border-4 border-warn flex items-center justify-center'>
                                <Target size={60} className='text-warn p-1' />
                            </span>
                            <div className='w-7/10 flex justify-between flex-col'>
                                <h3 className='text-xl font-bold'>Our Mission</h3>
                                <p className='text-sm font-normal text-muted leading-tight'>
                                    To uplift and empower communities through education, welfare initiatives, and timely aid—one act of kindness at a time.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center justify-center gap-3'>
                            <span className='aspect-square rounded-full border-4 border-warn flex items-center justify-center'>
                                <HeartHandshake size={60} className='text-warn p-1' />
                            </span>
                            <div className='w-7/10 flex justify-between flex-col'>
                                <h3 className='text-xl font-bold'>Our Vision</h3>
                                <p className='text-sm font-normal text-muted leading-tight'>
                                    A world where compassion leads, every voice matters, and every person has access to dignity, opportunity, and hope.
                                </p>
                            </div>
                        </div>
                    </div>

                    <span className='mt-3'>
                        <CustomBtn label='More About Us' icon={<ArrowRight size={18} className='z-10' />} href='/about' />
                    </span>
                </div>

            </div>
        </div>
    )
}

export default AboutSection
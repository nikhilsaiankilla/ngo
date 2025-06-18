import { ArrowRight, Target } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AboutSection = () => {
    return (
        <div className="w-full bg-light py-4 px-6 sm:px-8">
            <div className='w-full md:w-7xl mx-auto flex justify-between flex-col-reverse md:flex-row gap-5 mt-10'>
                <div className="w-full aspect-square relative">
                    <Image src='/about.png' alt="indian map with kids inside them" unoptimized width={100} height={100} className="w-full h-full object-contain" />
                </div>

                <div className='w-full flex justify-between flex-col mt-10'>
                    <div>
                        <h2 className='text-2xl font-bold text-brand'>Who Are We</h2>
                        <h1 className='text-5xl font-extrabold text-dark'>Hussaini Welfare Association</h1>
                    </div>

                    <p className='text-sm font-normal text-muted mt-4'>
                        Hussaini Welfare Association is a non-profit organization dedicated to serving humanity through compassion and action. We strive to bring meaningful change to the lives of the underprivileged.
                    </p>

                    <p className='text-sm font-normal text-muted mt-4'>
                        With a strong belief in unity, we work tirelessly across various areas—education, health, food, and emergency relief—focusing on building a better and just society for all.
                    </p>

                    <p className='text-sm font-normal text-muted mt-4'>
                        Our team is driven by passion, guided by values, and supported by generous hearts like yours. We invite you to join hands with us in our mission of spreading hope and service.
                    </p>

                    <div className='flex items-center justify-between flex-col md:flex-row mt-5 gap-4'>
                        <div className='flex items-center justify-center gap-3'>
                            <span className='aspect-square rounded-full border-4 border-warn flex items-center justify-center'>
                                <Target size={60} className='text-warn' />
                            </span>
                            <div className='w-7/10 flex justify-between flex-col'>
                                <h3 className='text-xl font-bold'>Our Mission</h3>
                                <p className='text-sm font-normal text-muted leading-tight'>To uplift lives through education, welfare, and emergency aid—one act of kindness at a time.</p>
                            </div>
                        </div>

                        <div className='flex items-center justify-center gap-3'>
                            <span className='aspect-square rounded-full border-4 border-warn flex items-center justify-center'>
                                <Target size={60} className='text-warn' />
                            </span>
                            <div className='w-7/10 flex justify-between flex-col'>
                                <h3 className='text-xl font-bold'>Our Vision</h3>
                                <p className='text-sm font-normal text-muted leading-tight'>A society where compassion prevails, and every individual has the opportunity to live with dignity.</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href='/about'
                        className='relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-warn text-white font-semibold shadow-md hover:bg-brand transition-all duration-300 ease-in-out group overflow-hidden mt-5 w-fit'
                    >
                        <span className='absolute inset-0 rounded-2xl bg-glow opacity-20 blur-md group-hover:opacity-40 group-hover:blur-lg transition duration-300 z-0'></span>
                        <span className='z-10'>More About Us</span>
                        <ArrowRight size={18} className='z-10' />
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default AboutSection
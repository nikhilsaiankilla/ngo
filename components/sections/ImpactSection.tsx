import React from 'react'
import { CalendarCheck, HeartHandshake, User } from 'lucide-react'

const ImpactSection = () => {
    return (
        <section className='py-32 px-6 sm:px-8 bg-light flex items-center justify-center'>
            <div className='w-full md:w-7xl mx-auto'>
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">Be a Part of Something Bigger</h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">Building a Better Tomorrow</h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    At Hussaini Welfare Association, we’re committed to creating lasting change through health camps, education support, food drives, and community development. Together, we can restore dignity and offer hope to those in need.
                </p>

                <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-10 gap-5'>

                    <div className="w-full flex items-center justify-between rounded-2xl overflow-hidden">
                        <div className='w-3/5 aspect-square flex items-center justify-center bg-warn'>
                            <CalendarCheck size={70} className='text-white' />
                        </div>

                        <div className='w-7/10 p-4 border-3 border-l-0 h-full border-gray-200'>
                            <h3 className='text-md font-semibold'>
                                <span className='text-2xl font-bold text-warn'>10+</span> Events Conducted
                            </h3>
                            <p className='text-sm text-muted mt-2'>From medical camps to awareness drives, every event brings hope closer to home.</p>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-between rounded-2xl overflow-hidden">
                        <div className='w-3/5 aspect-square flex items-center justify-center bg-success'>
                            <HeartHandshake size={70} className='text-white' />
                        </div>

                        <div className='w-7/10 p-4 border-3 border-l-0 h-full border-gray-200'>
                            <h3 className='text-md font-semibold'>
                                <span className='text-2xl font-bold text-success'>1M+</span> Donations Received
                            </h3>
                            <p className='text-sm text-muted mt-2'>Your generosity fuels our mission, empowering lives across communities.</p>
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-between rounded-2xl overflow-hidden">
                        <div className='w-3/5 aspect-square flex items-center justify-center bg-danger'>
                            <User size={70} className='text-white' />
                        </div>

                        <div className='w-7/10 p-4 border-3 border-l-0 h-full border-gray-200'>
                            <h3 className='text-md font-semibold'>
                                <span className='text-2xl font-bold text-danger'>300+</span> People Helped
                            </h3>
                            <p className='text-sm text-muted mt-2'>Every person we support is a step toward a more compassionate world.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>

    )
}

export default ImpactSection
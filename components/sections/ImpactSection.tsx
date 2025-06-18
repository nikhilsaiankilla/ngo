import React from 'react'
import { CalendarCheck, Heart, HeartHandshake, Users } from 'lucide-react'
import CustomBtn from '../buttons/CustomBtn'

const ImpactSection = () => {
    return (
        <section className='py-20 px-6 sm:px-8 flex items-center justify-center'>
            <div className='w-full md:w-7xl mx-auto'>
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">Be a Part of Something Bigger</h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">Building a Better Tomorrow</h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    Hussaini Welfare Association is driving change through healthcare camps, educational outreach, food relief, and community empowerment. Together, we’re restoring dignity and delivering hope—one life at a time.
                </p>

                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10 gap-5'>

                    <div className="w-full flex items-stretch rounded-2xl overflow-hidden shadow border border-gray-200">
                        {/* Left Icon Container */}
                        <div className="flex-shrink-0 w-2/5 bg-warn flex items-center justify-center aspect-square">
                            <CalendarCheck size={50} className="text-white" />
                        </div>

                        {/* Right Text Container */}
                        <div className="flex-grow p-4 flex flex-col justify-center overflow-hidden">
                            <h3 className="text-md font-semibold leading-snug">
                                <span className="text-2xl font-bold text-warn">10+</span> Impactful Events
                            </h3>
                            <p className="text-sm text-muted mt-1 leading-tight">
                                From health checkups to awareness campaigns, every initiative brings help where it matters most.
                            </p>
                        </div>
                    </div>

                    <div className="w-full flex items-stretch rounded-2xl overflow-hidden shadow border border-gray-200">
                        {/* Left Icon Container */}
                        <div className="flex-shrink-0 w-2/5 bg-success flex items-center justify-center aspect-square">
                            <HeartHandshake size={50} className='text-white' />
                        </div>

                        {/* Right Text Container */}
                        <div className="flex-grow p-4 flex flex-col justify-center overflow-hidden">
                            <h3 className="text-md font-semibold leading-snug">
                                <span className="text-2xl font-bold text-success">1M+</span> in Donations
                            </h3>
                            <p className="text-sm text-muted mt-1 leading-tight">
                                Every rupee fuels our mission—powering programs that uplift and transform communities.
                            </p>
                        </div>
                    </div>

                    <div className="w-full flex items-stretch rounded-2xl overflow-hidden shadow border border-gray-200">
                        {/* Left Icon Container */}
                        <div className="flex-shrink-0 w-2/5 bg-danger flex items-center justify-center aspect-square">
                            <Users size={50} className='text-white' />
                        </div>

                        {/* Right Text Container */}
                        <div className="flex-grow p-4 flex flex-col justify-center overflow-hidden">
                            <h3 className="text-md font-semibold leading-snug">
                                <span className="text-2xl font-bold text-danger">300+</span> Lives Touched
                            </h3>
                            <p className="text-sm text-muted mt-1 leading-tight">
                                Behind every number is a story of hope, care, and a future rewritten with dignity.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='mt-16 rounded-2xl bg-light px-6 text-center'>
                    <h2 className='text-xl md:text-2xl font-bold text-brand'>Ready to Make a Difference?</h2>
                    <p className='text-sm text-muted mt-2 mb-4 max-w-xl mx-auto'>
                        Every contribution counts. Help us expand our reach and impact more lives.
                    </p>
                    <CustomBtn label="Join Our Mission" href="/donate" icon={<Heart className="w-4 h-4" />} />
                </div>

            </div>
        </section>
    )
}

export default ImpactSection
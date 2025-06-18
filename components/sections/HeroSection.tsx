import React from 'react'
import Navbar from '../Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { adminDb } from '@/firebase/firebaseAdmin'
import { ArrowRight } from 'lucide-react'

const HeroSection = async () => {

    const latestEventSnapshot = await adminDb
        .collection('events')
        .orderBy('createdAt', 'desc') // Sort by 'createdAt' in descending order (most recent first)
        .limit(1) // Fetch only the latest event
        .get();

    const event = latestEventSnapshot.docs[0].data();

    return (
        <div className="w-full min-h-screen bg-light">
            {/* Navbar */}
            <Navbar />
            <section className="w-full md:w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 py-4 px-6 sm:px-8">

                <div className="w-full md:w-4/5 ml-0 mt-7 md:mt-14">
                    <div className="w-full">
                        <h2 className="text-2xl font-bold capitalize text-brand">Together, We Make a Difference</h2>
                        <h1 className="text-5xl font-extrabold uppercase mt-2">Empowering Lives, One Act of Kindness at a Time</h1>
                        <p className="text-sm text-muted mt-2">
                            Join hands with Hussani Welfare Association to bring hope, support, and change to the underserved. From food drives to educational programs, every step we take is powered by your compassion.
                        </p>
                    </div>

                    <Link
                        className="w-full mt-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                        href={`/events/${event?.id}`}
                    >
                        {/* Image: 30% width on md+ screens */}
                        <div className="w-full aspect-square col-span-1">
                            <Image
                                src={event?.image}
                                alt="Event Image"
                                width={600}
                                height={400}
                                className="w-full h-full object-cover rounded-xl aspect-square"
                            />
                        </div>

                        {/* Text: 70% width on md+ screens */}
                        <div className="w-full flex flex-col col-span-2">
                            <h3 className="text-xl font-extrabold leading-tight text-dark uppercase">
                                Be a Part of Our Next Big Mission
                            </h3>
                            <p className="text-sm text-muted">
                                Join hands with us in our upcoming campaign to uplift lives and spread hope. Every contribution counts—whether it's your time, effort, or voice. Let’s make a difference together.
                            </p>
                            <Link
                                href={`/events/${event?.id}`}
                                className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
                            >
                                View Upcomming Event
                                <ArrowRight className="h-4 w-4 -rotate-45" />
                            </Link>
                        </div>

                    </Link>


                </div>

                <div className="w-full ml-5 mt-10 md:mt-0 relative">
                    <Card className="w-60 shadow-md rounded-2xl absolute bottom-2 md:bottom-5 left-2 md:left-7">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800">Total Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="-mt-5">
                            <h1 className="text-5xl font-extrabold text-brand">100+</h1>
                            <h2 className="text-sm text-muted-foreground">Events</h2>
                        </CardContent>
                    </Card>
                    <Image src='/hero.png' alt="indian map with kids inside them" unoptimized width={100} height={100} className="w-full h-full object-contain" />
                </div>

            </section>
        </div>
    )
}

export default HeroSection
import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { adminDb } from '@/firebase/firebaseAdmin'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const HeroSection = async () => {

    const latestEventSnapshot = await adminDb
        .collection('events')
        .orderBy('createdAt', 'desc') // Sort by 'createdAt' in descending order (most recent first)
        .limit(1) // Fetch only the latest event
        .get();

    const event = latestEventSnapshot.docs[0].data();

    return (
        <section className="w-full lg:w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 px-6 sm:px-8">

            <div className="w-full lg:w-4/5 ml-0 mt-7 md:mt-14">
                <div className="w-full">
                    <h2 className="text-lg sm:text-2xl font-bold capitalize text-brand">
                        Together, We Create Real Change
                    </h2>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-5xl font-bold uppercase mt-2">
                        Empowering Lives Through Every Act of Kindness
                    </h1>
                    <p className="text-sm text-muted mt-2">
                        Join hands with Hussani Welfare Association to bring hope, dignity, and opportunity to those who need it most. From hunger relief to education and healthcare, your compassion powers every step forward.
                    </p>
                </div>

                {/* Highlight Card */}
                <Link
                    href={`/events/${event?.id}`}
                    className="w-full mt-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center"
                >
                    {/* Image */}
                    <div className="w-full md:w-1/3 aspect-square">
                        <Image
                            src={event?.image}
                            alt="Event Image"
                            width={600}
                            height={400}
                            className="w-full h-full object-cover rounded-xl"
                        />
                    </div>

                    {/* Text */}
                    <div className="w-full md:w-2/3 flex flex-col justify-between">
                        <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-dark uppercase">
                            Join Our Next Big Mission
                        </h3>
                        <p className="text-sm text-muted leading-tight">
                            Be part of our upcoming initiative focused on transforming lives and spreading light in underserved communities. Whether you donate, volunteer, or advocate — your support matters more than ever.
                        </p>
                        <Link
                            href={`/events/${event?.id}`}
                            className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
                        >
                            Explore the Event
                            <ArrowRight className="h-4 w-4 -rotate-45" />
                        </Link>
                    </div>
                </Link>

            </div>

            <div className="w-full md:w-4/5 ml-5 mt-10 lg:mt-0 md:mx-auto relative">
                <Card className="w-40 md:w-60 shadow-lg rounded-2xl absolute -bottom-14 md:bottom-5 left-2 md:left-7">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">
                            Total Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-5">
                        <h1 className="text-2xl md:text-5xl font-extrabold text-brand">100+</h1>
                        <h2 className="text-sm text-muted-foreground">Community-Driven Events</h2>
                    </CardContent>
                </Card>
                <Image src='/hero.png' alt="indian map with kids inside them" width={100} unoptimized height={100} className="w-full h-full object-contain" />
            </div>
        </section>
    )
}

export default HeroSection
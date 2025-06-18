'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Mail } from 'lucide-react';

const teamMembers = [
    {
        name: 'Ramesh Verma',
        role: 'Founder & Director',
        image: 'https://randomuser.me/api/portraits/men/27.jpg', // replace with actual public path or use external URL
        socials: {
            linkedin: '#',
            twitter: '#',
            email: 'mailto:ramesh@example.org',
        },
    },
    {
        name: 'Priya Mehta',
        role: 'Program Coordinator',
        image: 'https://randomuser.me/api/portraits/women/25.jpg',
        socials: {
            linkedin: '#',
            twitter: '#',
            email: 'mailto:priya@example.org',
        },
    },
    {
        name: 'Arjun Rao',
        role: 'Field Volunteer Lead',
        image: 'https://randomuser.me/api/portraits/men/24.jpg',
        socials: {
            linkedin: '#',
            twitter: '#',
            email: 'mailto:arjun@example.org',
        },
    },
    {
        name: 'Sneha Desai',
        role: 'Media & Communications',
        image: 'https://randomuser.me/api/portraits/women/23.jpg',
        socials: {
            linkedin: '#',
            twitter: '#',
            email: 'mailto:sneha@example.org',
        },
    },
];

const TeamSection = () => {
    return (
        <section className="py-22 bg-light flex items-center justify-center">
            <div className="w-full md:w-7xl mx-auto px-6 sm:px-8">
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">
                    meet our team
                </h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">
                    Our Organization Members
                </h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    Our dedicated team works tirelessly to bring real change to communities. Here's the
                    heart behind the mission.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="rounded-2xl w-full shadow-md grid grid-cols-2 gap-4 overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            {/* Image Section */}
                            <div className="relative w-full aspect-[2/3]">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-col justify-center px-4 py-6 text-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-dark">{member.name}</h3>
                                    <p className="text-sm text-muted mt-1">{member.role}</p>
                                </div>

                                <div className="flex justify-center gap-4 mt-4">
                                    <Link href={member.socials.linkedin} target="_blank">
                                        <Linkedin className="text-brand hover:text-dark transition-colors" size={22} />
                                    </Link>
                                    <Link href={member.socials.twitter} target="_blank">
                                        <Twitter className="text-brand hover:text-dark transition-colors" size={22} />
                                    </Link>
                                    <Link href={member.socials.email}>
                                        <Mail className="text-brand hover:text-dark transition-colors" size={22} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;

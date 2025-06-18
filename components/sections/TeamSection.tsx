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
];

const TeamSection = () => {

    const cardColors = ["#1E3A8A", "#DC2626", "#F97316"];

    return (
        <section className="py-22 bg-light flex items-center justify-center">
            <div className="w-full md:w-7xl mx-auto px-6 sm:px-8">
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">
                    Meet Our Team
                </h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">
                    Our Organization Members
                </h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    Our dedicated team works tirelessly to bring real change to communities. Here's the
                    heart behind the mission.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            style={{ 'color': cardColors[index % cardColors.length] }}
                            className={`rounded-2xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex flex-col items-center text-center border border-gray-200`}
                        >
                            <Image
                                src={member.image}
                                alt={`${member.name} Image`}
                                width={300}
                                height={300}
                                className="w-full h-72 object-cover"
                            />

                            <div
                                className="w-full p-5 rounded-b-2xl border-[2px] border-t-0"
                                style={{
                                    borderColor: cardColors[index % cardColors.length],
                                }}
                            >
                                <h2 className="text-lg font-semibold text-dark">{member.name}</h2>
                                <p className="text-sm text-muted">{member.role}</p>

                                <ul className="flex items-center justify-center gap-4 mt-4"
                                    style={{ 'color': cardColors[index % cardColors.length] }}
                                >
                                    {member.socials?.email && (
                                        <li>
                                            <Link href={member.socials.email} target="_blank">
                                                <Mail size={20} />
                                            </Link>
                                        </li>
                                    )}
                                    {member.socials?.linkedin && (
                                        <li>
                                            <Link href={member.socials.linkedin} target="_blank">
                                                <Linkedin size={20} />
                                            </Link>
                                        </li>
                                    )}
                                    {member.socials?.twitter && (
                                        <li>
                                            <Link href={member.socials.twitter} target="_blank">
                                                <Twitter size={20} />
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;

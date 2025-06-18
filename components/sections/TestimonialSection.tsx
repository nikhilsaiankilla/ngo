import React from 'react';
import { Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        name: "Anjali Sharma",
        role: "Beneficiary – Clean Water Program",
        message: "Thanks to your donations, our village now has access to clean drinking water. You've given us more than water — you've given us hope.",
        image: "https://randomuser.me/api/portraits/women/22.jpg"
    },
    {
        name: "Ravi Kumar",
        role: "Volunteer – Medical Camps",
        message: "Volunteering here changed my life. The support from the organization and the community has been overwhelming and inspiring.",
        image: "https://randomuser.me/api/portraits/men/65.jpg"
    },
    {
        name: "Sita Verma",
        role: "Mother of 2 – Education Program",
        message: "Both my children are now going to school and learning so much. I never imagined this could be possible. Thank you for everything.",
        image: "https://randomuser.me/api/portraits/women/65.jpg"
    }
];

const TestimonialSection = () => {
    return (
        <section className='py-22 bg-light flex items-center justify-center'>
            <div className='w-full md:w-7xl mx-auto px-6 sm:px-8'>
                <h3 className="text-lg md:text-2xl font-bold text-warn capitalize text-center">Voices of Impact</h3>
                <h1 className="text-3xl md:text-5xl font-extrabold capitalize text-brand text-center">What They Say About Us</h1>
                <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
                    Real stories from real people whose lives have been touched by your generosity and support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center text-center gap-4"
                        >
                            <div className="relative">
                                <Image
                                    width={100}
                                    height={100}
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-brand"
                                />
                                <Quote className="absolute -top-3 -right-3 text-warn opacity-80" size={24} />
                            </div>
                            <p className="text-sm text-dark italic">“{testimonial.message}”</p>
                            <div>
                                <h3 className="text-base font-semibold text-warn">{testimonial.name}</h3>
                                <p className="text-xs text-muted">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;

import React from 'react'
import SafeImage from '../SafeImage'
import { markdownToHtmlText } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  createdAt?: string;
  createdBy: string;
  description: string;
  image: string;
  tagline: string;
  title: string;
  updatedAt?: string;
}

type ServiceCardProps = {
  service: Service;
};


const ServiceCard: React.FC<ServiceCardProps> = async ({ service }) => {

  const desc = await markdownToHtmlText(service.description);
  return (
    <div className="bg-white rounded-tr-3xl rounded-b-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <SafeImage
        src={service.image}
        alt={`${service.title} Image`}
        width={500}
        height={280}
        className="w-full h-60 object-cover rounded-bl-3xl"
      />

      <div className="flex flex-col justify-between p-5 space-y-4">

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-warn transition-colors duration-200">
            {service.title}
          </h3>
          <h5 className='text-sm text-dark my-2'>{service?.tagline}</h5>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{desc}</p>
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <Link
            href={`/events/${service.id}`}
            className="flex items-center gap-1 text-sm font-medium text-warn hover:underline"
          >
            View Details
            <ArrowRight className="h-4 w-4 -rotate-45" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
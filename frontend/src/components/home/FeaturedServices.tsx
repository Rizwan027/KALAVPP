'use client';

import Link from 'next/link';

export default function FeaturedServices() {
  const services = [
    { id: '1', title: 'Custom Portrait Commission', price: 28000, type: 'Commission' },
    { id: '2', title: 'Digital Art Workshop', price: 7920, type: 'Workshop' },
    { id: '3', title: 'Logo Design Service', price: 20000, type: 'Service' },
    { id: '4', title: 'Art Consultation', price: 12000, type: 'Consultation' },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="section-heading">
          <h2 className="section-title">Popular Services</h2>
          <p className="section-subtitle">
            Book creative services from professional artists
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="card-hover group"
            >
              <span className="badge-primary mb-4">{service.type}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                {service.title}
              </h3>
              <p className="mt-2 text-lg font-bold text-primary-600">
                Starting at ₹{service.price}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/services" className="btn-primary">
            Browse All Services
          </Link>
        </div>
      </div>
    </section>
  );
}

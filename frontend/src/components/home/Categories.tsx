'use client';

import Link from 'next/link';
import { FiImage, FiMonitor, FiBox, FiCamera, FiEdit, FiBook, FiVideo, FiUsers } from 'react-icons/fi';

const categories = [
  {
    name: 'Paintings',
    icon: FiImage,
    href: '/products?category=paintings',
    color: 'bg-red-100 text-red-600',
  },
  {
    name: 'Digital Art',
    icon: FiMonitor,
    href: '/products?category=digital-art',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Sculptures',
    icon: FiBox,
    href: '/products?category=sculptures',
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Photography',
    icon: FiCamera,
    href: '/products?category=photography',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Commissions',
    icon: FiEdit,
    href: '/services?type=commission',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    name: 'Workshops',
    icon: FiUsers,
    href: '/services?type=workshop',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Courses',
    icon: FiBook,
    href: '/services?type=course',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Consultation',
    icon: FiVideo,
    href: '/services?type=consultation',
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="section-heading">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">
            Find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:shadow-lg"
              >
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${category.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

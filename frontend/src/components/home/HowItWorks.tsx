'use client';

import { FiSearch, FiShoppingCart, FiTruck, FiStar } from 'react-icons/fi';

const steps = [
  {
    icon: FiSearch,
    title: 'Discover',
    description: 'Browse thousands of unique artworks and creative services',
  },
  {
    icon: FiShoppingCart,
    title: 'Purchase',
    description: 'Secure checkout with UPI, cards, and other Indian payment methods',
  },
  {
    icon: FiTruck,
    title: 'Receive',
    description: 'Get your artwork delivered or download digital files instantly',
  },
  {
    icon: FiStar,
    title: 'Enjoy',
    description: 'Rate your experience and support artists you love',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="section-heading">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Getting started is easy
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

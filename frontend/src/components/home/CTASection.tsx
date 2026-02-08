'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16 text-white">
      <div className="container-custom text-center">
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
          Ready to Start Your Creative Journey?
        </h2>
        <p className="mb-8 text-lg text-white/90">
          Join thousands of artists and art lovers on KALAVPP
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register?role=vendor"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-primary-600 transition-all hover:bg-gray-100"
          >
            Become a Vendor
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

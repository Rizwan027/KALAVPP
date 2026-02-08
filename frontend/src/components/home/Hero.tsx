'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              India's Marketplace for{' '}
              <span className="text-primary-600">Art & Creativity</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 lg:text-xl">
              Connecting Indian artists with art lovers nationwide. Buy unique artwork,
              commission custom pieces, or showcase your talent across India.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products" className="btn-primary text-center">
                Browse Artwork
              </Link>
              <Link href="/services" className="btn-outline text-center">
                Explore Services
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
              <div>
                <p className="text-3xl font-bold text-primary-600">10K+</p>
                <p className="mt-1 text-sm text-gray-600">Artworks</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600">5K+</p>
                <p className="mt-1 text-sm text-gray-600">Artists</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600">50K+</p>
                <p className="mt-1 text-sm text-gray-600">Happy Customers</p>
              </div>
            </div>
          </motion.div>

          {/* Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary-200 to-secondary-200">
              {/* Placeholder for hero image */}
              <div className="flex h-full items-center justify-center text-6xl">
                🎨
              </div>
            </div>
            
            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -left-4 top-1/4 rounded-lg bg-white p-4 shadow-lg"
            >
              <p className="text-sm font-semibold">🖼️ Physical Art</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -right-4 top-1/2 rounded-lg bg-white p-4 shadow-lg"
            >
              <p className="text-sm font-semibold">💻 Digital Downloads</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute bottom-8 left-1/4 rounded-lg bg-white p-4 shadow-lg"
            >
              <p className="text-sm font-semibold">✨ Custom Commissions</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

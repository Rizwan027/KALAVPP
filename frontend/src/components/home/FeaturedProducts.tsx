'use client';

import Link from 'next/link';

export default function FeaturedProducts() {
  // Placeholder products - will be replaced with API data
  const products = [
    { id: '1', title: 'Abstract Canvas', price: 23920, image: '🎨' },
    { id: '2', title: 'Digital Portrait', price: 11920, image: '🖼️' },
    { id: '3', title: 'Sculpture', price: 39920, image: '🗿' },
    { id: '4', title: 'Photography Print', price: 15920, image: '📸' },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="section-heading">
          <h2 className="section-title">Featured Artwork</h2>
          <p className="section-subtitle">
            Handpicked pieces from our talented artists
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="card-hover group"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 text-6xl flex items-center justify-center">
                {product.image}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                {product.title}
              </h3>
              <p className="mt-1 text-lg font-bold text-primary-600">
                ₹{product.price}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/products" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

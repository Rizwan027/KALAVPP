'use client';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Art Collector, Mumbai',
    content: 'Found amazing unique pieces for my home. The quality and service are exceptional! Prices in rupees make it so convenient.',
    rating: 5,
  },
  {
    name: 'Arjun Patel',
    role: 'Digital Artist, Bangalore',
    content: 'As a vendor, this platform has helped me reach customers across India. Game changer for independent artists!',
    rating: 5,
  },
  {
    name: 'Meera Reddy',
    role: 'Art Enthusiast, Delhi',
    content: 'Commissioned a custom portrait and couldn\'t be happier. Great prices and talented Indian artists all in one place!',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="section-heading">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <div className="mb-4 flex text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <p className="mb-4 text-gray-700">{testimonial.content}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

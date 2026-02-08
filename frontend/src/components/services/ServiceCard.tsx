'use client';

import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar, FiClock, FiCalendar } from 'react-icons/fi';
import { Service } from '@/lib/services';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    dispatch(
      addToCart({
        id: service.id,
        type: 'service',
        serviceId: service.id,
        title: service.title,
        price: service.price,
        quantity: 1,
        image: service.images[0]?.imageUrl,
        vendorId: service.vendor.id,
        vendorName: service.vendor.user.name,
      })
    );
    
    toast.success('Service added to cart!');
  };

  const imageUrl = service.images[0]?.imageUrl 
    ? (service.images[0].imageUrl.startsWith('http') 
        ? service.images[0].imageUrl 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${service.images[0].imageUrl}`)
    : '/placeholder-service.jpg';

  return (
    <Link href={`/services/${service.id}`} className="group">
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Service Image */}
        <div className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Service Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
              Service
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toast.success('Added to wishlist!');
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <FiHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>

        {/* Service Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-purple-600 font-medium mb-1">
            {service.category.name}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
            {service.title}
          </h3>

          {/* Vendor */}
          <p className="text-sm text-gray-500 mb-2">
            by {service.vendor.user.name}
          </p>

          {/* Service Details */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            {service.duration && (
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                <span>{service.duration}</span>
              </div>
            )}
            {service.deliveryTime && (
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{service.deliveryTime}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {service.avgRating && service.reviewCount ? (
            <div className="flex items-center gap-1 mb-3">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{Number(service.avgRating).toFixed(1)}</span>
              <span className="text-sm text-gray-500">({service.reviewCount})</span>
            </div>
          ) : (
            <div className="mb-3">
              <span className="text-sm text-gray-500">No reviews yet</span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Starting at</span>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Number(service.price).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary flex items-center gap-2"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

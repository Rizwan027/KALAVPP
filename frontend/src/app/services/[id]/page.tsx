'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiClock, FiCalendar, FiLoader, FiUser } from 'react-icons/fi';
import { serviceApi, Service } from '@/lib/services';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string);
    }
  }, [params.id]);

  const fetchService = async (id: string) => {
    try {
      setLoading(true);
      const data = await serviceApi.getService(id);
      setService(data);
    } catch (error: any) {
      console.error('Error fetching service:', error);
      toast.error(error.response?.data?.message || 'Service not found');
      router.push('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!service) return;

    dispatch(
      addToCart({
        id: service.id,
        type: 'service',
        serviceId: service.id,
        title: service.title,
        price: service.price,
        quantity,
        image: service.images[0]?.imageUrl,
        vendorId: service.vendor.id,
        vendorName: service.vendor.user.name,
      })
    );

    toast.success(`Added ${quantity} service(s) to cart!`);
  };

  const handleBookNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const imageUrl = service?.images?.[selectedImage]?.imageUrl
    ? (service.images[selectedImage].imageUrl.startsWith('http')
        ? service.images[selectedImage].imageUrl
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${service.images[selectedImage].imageUrl}`)
    : '/placeholder-service.jpg';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-purple-600">Services</Link>
          <span>/</span>
          <Link href={`/services?categoryId=${service.categoryId}`} className="hover:text-purple-600">
            {service.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Service Images */}
          <div>
            {/* Main Image */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={imageUrl}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {service.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {service.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image.imageUrl}`}
                      alt={`${service.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div>
            {/* Service Badge */}
            <div className="mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                Creative Service
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {service.title}
            </h1>

            {/* Vendor */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Provided by</p>
                <Link 
                  href={`/vendors/${service.vendor.user.id}`}
                  className="text-lg text-purple-600 hover:text-purple-700 font-medium"
                >
                  {service.vendor.user.name}
                </Link>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(service.avgRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{service.avgRating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-500">({service.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Starting at</p>
              <p className="text-4xl font-bold text-gray-900">
                ₹{Number(service.price).toFixed(2)}
              </p>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
              {service.duration && (
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-medium">{service.duration}</p>
                  </div>
                </div>
              )}
              {service.deliveryTime && (
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Delivery Time</p>
                    <p className="font-medium">{service.deliveryTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(val, 99)));
                  }}
                  className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                  min="1"
                  max="99"
                />
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, 99))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBookNow}
                className="btn-primary flex-1"
              >
                Book Now
              </button>
              <button
                onClick={() => toast.success('Added to wishlist!')}
                className="btn-secondary w-12 h-12 flex items-center justify-center"
              >
                <FiHeart className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <FiCheck className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <p className="font-medium">Professional Service</p>
                  <p className="text-sm text-gray-600">Delivered by verified artist</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCheck className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <p className="font-medium">Satisfaction Guaranteed</p>
                  <p className="text-sm text-gray-600">100% quality assurance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCheck className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-600">Your payment is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-purple-600 font-semibold text-purple-600">
                Description
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap mb-6">{service.description}</p>
            
            {service.requirements && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{service.requirements}</p>
              </div>
            )}

            {service.tags && service.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          
          {service.reviewCount === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No reviews yet</p>
              <p className="text-sm text-gray-500">Be the first to review this service!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600">Reviews coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

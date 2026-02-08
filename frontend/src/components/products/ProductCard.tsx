'use client';

import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { Product } from '@/lib/products';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    dispatch(
      addToCart({
        id: product.id,
        type: 'product',
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.images[0]?.imageUrl,
        vendorId: product.vendor.id,
        vendorName: product.vendor.user.name,
      })
    );
    
    toast.success('Added to cart!');
  };

  const imageUrl = product.images[0]?.imageUrl 
    ? (product.images[0].imageUrl.startsWith('http') 
        ? product.images[0].imageUrl 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].imageUrl}`)
    : '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Product Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Product Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              product.type === 'DIGITAL' 
                ? 'bg-purple-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {product.type === 'DIGITAL' ? 'Digital' : 'Physical'}
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

          {/* Stock Badge */}
          {product.type === 'PHYSICAL' && product.stockQuantity !== null && product.stockQuantity <= 5 && (
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                Only {product.stockQuantity} left!
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-primary-600 font-medium mb-1">
            {product.category.name}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.title}
          </h3>

          {/* Vendor */}
          <p className="text-sm text-gray-500 mb-2">
            by {product.vendor.user.name}
          </p>

          {/* Rating */}
          {product.avgRating && product.reviewCount ? (
            <div className="flex items-center gap-1 mb-3">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{Number(product.avgRating).toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviewCount})</span>
            </div>
          ) : (
            <div className="mb-3">
              <span className="text-sm text-gray-500">No reviews yet</span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{Number(product.price).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.type === 'PHYSICAL' && product.stockQuantity === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {product.type === 'PHYSICAL' && product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

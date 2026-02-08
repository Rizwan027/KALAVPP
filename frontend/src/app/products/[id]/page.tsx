'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiTruck, FiDownload, FiLoader } from 'react-icons/fi';
import { productApi, Product } from '@/lib/products';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productApi.getProduct(id);
      setProduct(data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Product not found');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        id: product.id,
        type: 'product',
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images[0]?.imageUrl,
        vendorId: product.vendor.id,
        vendorName: product.vendor.user.name,
      })
    );

    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const imageUrl = product?.images?.[selectedImage]?.imageUrl
    ? (product.images[selectedImage].imageUrl.startsWith('http')
        ? product.images[selectedImage].imageUrl
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[selectedImage].imageUrl}`)
    : '/placeholder-product.jpg';

  const isOutOfStock = product.type === 'PHYSICAL' && product.stockQuantity === 0;
  const isLowStock = product.type === 'PHYSICAL' && product.stockQuantity !== null && product.stockQuantity <= 5;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image.imageUrl}`}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Type Badge */}
            <div className="mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                product.type === 'DIGITAL' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {product.type === 'DIGITAL' ? 'Digital Product' : 'Physical Product'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            {/* Vendor */}
            <p className="text-lg text-gray-600 mb-4">
              by{' '}
              <Link 
                href={`/vendors/${product.vendor.user.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {product.vendor.user.name}
              </Link>
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.avgRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{product.avgRating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                ₹{Number(product.price).toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            {product.type === 'PHYSICAL' && (
              <div className="mb-6">
                {isOutOfStock ? (
                  <p className="text-red-600 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Out of Stock
                  </p>
                ) : isLowStock ? (
                  <p className="text-orange-600 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                    Only {product.stockQuantity} left in stock
                  </p>
                ) : (
                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <FiCheck className="w-5 h-5" />
                    In Stock
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
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
                      const max = product.type === 'PHYSICAL' && product.stockQuantity !== null
                        ? product.stockQuantity
                        : 99;
                      setQuantity(Math.max(1, Math.min(val, max)));
                    }}
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                    min="1"
                    max={product.type === 'PHYSICAL' && product.stockQuantity !== null ? product.stockQuantity : 99}
                  />
                  <button
                    onClick={() => {
                      const max = product.type === 'PHYSICAL' && product.stockQuantity !== null
                        ? product.stockQuantity
                        : 99;
                      setQuantity(Math.min(quantity + 1, max));
                    }}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
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
              {product.type === 'PHYSICAL' ? (
                <div className="flex items-start gap-3">
                  <FiTruck className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <FiDownload className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium">Instant Download</p>
                    <p className="text-sm text-gray-600">Available immediately after purchase</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <FiCheck className="w-6 h-6 text-primary-600 mt-1" />
                <div>
                  <p className="font-medium">Quality Guaranteed</p>
                  <p className="text-sm text-gray-600">100% satisfaction guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-primary-600 font-semibold text-primary-600">
                Description
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
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
          
          {product.reviewCount === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No reviews yet</p>
              <p className="text-sm text-gray-500">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Reviews will be displayed here */}
              <p className="text-gray-600">Reviews coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

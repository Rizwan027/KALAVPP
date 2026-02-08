'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    toast.success('Item removed from cart');
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id: itemId, quantity }));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  const imageUrl = (url?: string) => {
    if (!url) return '/placeholder-product.jpg';
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <FiShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{totalItems} items in your cart</p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link
                    href={item.type === 'product' ? `/products/${item.productId}` : `/services/${item.serviceId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={imageUrl(item.image)}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg hover:opacity-75 transition-opacity"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <Link
                          href={item.type === 'product' ? `/products/${item.productId}` : `/services/${item.serviceId}`}
                          className="font-semibold text-lg hover:text-primary-600 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          by {item.vendorName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.type === 'product' ? 'Product' : 'Service'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item.id, Math.max(1, val));
                            }}
                            className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                            min="1"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          ₹{Number(item.price).toFixed(2)} each
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{Number(totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-bold text-primary-600">
                    ₹{Number(totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <FiArrowRight className="w-5 h-5" />
              </button>

              <Link
                href="/products"
                className="btn-secondary w-full text-center block"
              >
                Continue Shopping
              </Link>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>30-day money back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

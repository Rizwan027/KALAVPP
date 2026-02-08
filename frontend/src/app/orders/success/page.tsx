'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/slices/cartSlice';
import { FiCheckCircle, FiLoader, FiPackage } from 'react-icons/fi';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      // Clear cart after successful payment
      dispatch(clearCart());
      setLoading(false);
    } else {
      // No session ID, redirect to home
      router.push('/');
    }
  }, [searchParams, dispatch, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FiPackage className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-blue-900">What's Next?</h2>
              </div>
              <ul className="text-left space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You'll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Track your order status in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>For digital products, download links will be available immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Physical items will be shipped to your address</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-secondary">
                Continue Shopping
              </Link>
              <Link href="/" className="btn-primary">
                Go to Homepage
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Payment processed securely by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

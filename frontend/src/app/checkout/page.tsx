'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { FiCreditCard, FiTruck, FiShoppingBag, FiLock, FiCheck } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL' | 'CREDIT_CARD'>('STRIPE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/products');
    }
  }, [user, items, router]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.productId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        price: item.price,
      }));

      if (paymentMethod === 'STRIPE') {
        // Create Stripe checkout session
        const response = await api.post('/payments/checkout-session', {
          items: orderItems,
          successUrl: `${window.location.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        });

        const { url } = response.data.data;

        // Redirect to Stripe checkout
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        // For other payment methods, create order directly
        const response = await api.post('/orders', {
          items: orderItems,
          shippingAddress: shippingInfo,
          billingAddress: sameAsShipping ? shippingInfo : billingInfo,
          paymentMethod,
          notes,
        });

        const order = response.data.data;

        // Clear cart
        dispatch(clearCart());

        toast.success('Order placed successfully!');
        router.push(`/orders/${order.id}`);
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const imageUrl = (url?: string) => {
    if (!url) return '/placeholder-product.jpg';
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Shipping', icon: FiTruck },
              { num: 2, label: 'Payment', icon: FiCreditCard },
              { num: 3, label: 'Review', icon: FiCheck },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step >= s.num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      step >= s.num ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.addressLine1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.addressLine2}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-600">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="STRIPE"
                        checked={paymentMethod === 'STRIPE'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mr-3"
                      />
                      <FiCreditCard className="w-6 h-6 mr-3 text-primary-600" />
                      <span className="font-medium">Credit/Debit Card (Stripe)</span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-600 opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        disabled
                        className="mr-3"
                      />
                      <span className="font-medium">PayPal (Coming Soon)</span>
                    </label>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Billing address same as shipping</span>
                    </label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Billing Address</h3>
                      {/* Similar fields as shipping */}
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={billingInfo.fullName}
                        onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                        className="input-field"
                        required
                      />
                      {/* Add more billing fields as needed */}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary flex-1">
                      Continue to Review
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Shipping Address</h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <p>{shippingInfo.fullName}</p>
                      <p>{shippingInfo.addressLine1}</p>
                      {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                      <p>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                      </p>
                      <p>{shippingInfo.country}</p>
                      <p>{shippingInfo.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6 pb-6 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Payment Method</h3>
                      <button
                        onClick={() => setStep(2)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4" />
                      {paymentMethod === 'STRIPE' ? 'Credit/Debit Card (Stripe)' : paymentMethod}
                    </p>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FiLock className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5" />
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={imageUrl(item.image)}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{Number(totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiLock className="w-4 h-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

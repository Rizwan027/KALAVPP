'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function VendorEarningsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vendor/earnings');
      return;
    }

    if (user?.role !== 'VENDOR' && user?.role !== 'ADMIN') {
      toast.error('Access denied');
      router.push('/');
      return;
    }

    fetchEarnings();
  }, [isAuthenticated, user, router]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors/earnings');
      setEarnings(response.data.data);
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast.error(error.response?.data?.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > earnings.pendingPayout) {
      toast.error(`Amount exceeds available balance (₹${Number(earnings.pendingPayout).toFixed(2)})`);
      return;
    }

    try {
      setRequesting(true);
      await api.post('/vendors/payout', { amount });
      toast.success('Payout request submitted successfully');
      setPayoutAmount('');
      fetchEarnings();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast.error(error.response?.data?.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  if (loading || !earnings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
          <p className="text-gray-600">Track your revenue and request payouts</p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{Number(earnings.totalEarnings).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{Number(earnings.platformCommission).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Platform Fee ({earnings.commissionRate}%)</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{Number(earnings.netEarnings).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Net Earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{Number(earnings.pendingPayout).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Available for Payout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Payout */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Available Balance:</strong> ₹{Number(earnings.pendingPayout).toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Payouts are processed within 3-5 business days
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="input-field pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={earnings.pendingPayout}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={requesting || earnings.pendingPayout <= 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? 'Processing...' : 'Request Payout'}
              </button>
            </form>
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payout History</h2>
            
            {earnings.recentPayouts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No payout history</p>
            ) : (
              <div className="space-y-3">
                {earnings.recentPayouts.map((payout: any) => (
                  <div key={payout.id} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-medium text-gray-900">₹{Number(payout.amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payout.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        payout.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{payout.payoutMethod}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

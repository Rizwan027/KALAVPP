'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiPackage,
  FiTrendingUp,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin access required.');
      router.push('/');
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, user, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                +{stats.users.recentSignups} this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.users.total}
            </h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="mt-3 flex gap-3 text-xs text-gray-500">
              <span>{stats.users.customers} customers</span>
              <span>{stats.users.vendors} vendors</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{Number(stats.revenue.total).toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {stats.orders.recent} recent
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.orders.total}
            </h3>
            <p className="text-sm text-gray-600">Total Orders</p>
            <div className="mt-3 flex gap-3 text-xs text-gray-500">
              <span>{stats.orders.pending} pending</span>
              <span>{stats.orders.completed} completed</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                {stats.products.active} active
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.products.total}
            </h3>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.vendors.pending}</p>
                <p className="text-sm text-gray-600">Pending Vendor Approvals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.vendors.approved}</p>
                <p className="text-sm text-gray-600">Approved Vendors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.services.total}</p>
                <p className="text-sm text-gray-600">Total Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.categories.total}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.reviews.total}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.services.active}</p>
              <p className="text-sm text-gray-600">Active Services</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.vendors.total}</p>
              <p className="text-sm text-gray-600">Total Vendors</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="btn-primary text-center"
          >
            Manage Users
          </button>
          <button
            onClick={() => router.push('/admin/vendors')}
            className="btn-primary text-center"
          >
            Vendor Approvals ({stats.vendors.pending})
          </button>
          <button
            onClick={() => router.push('/admin/orders')}
            className="btn-secondary text-center"
          >
            View All Orders
          </button>
          <button
            onClick={() => router.push('/admin/analytics')}
            className="btn-secondary text-center"
          >
            Platform Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

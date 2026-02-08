'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminVendorsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/vendors');
      return;
    }

    if (user?.role !== 'admin') {
      toast.error('Access denied');
      router.push('/');
      return;
    }

    fetchPendingVendors();
  }, [isAuthenticated, user, router]);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/vendors/pending');
      setVendors(response.data.data.vendors);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast.error(error.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      setProcessingId(vendorId);
      await api.post(`/admin/vendors/${vendorId}/approve`);
      toast.success('Vendor approved successfully');
      fetchPendingVendors();
    } catch (error: any) {
      console.error('Error approving vendor:', error);
      toast.error(error.response?.data?.message || 'Failed to approve vendor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = window.prompt('Rejection reason (optional):');
    
    try {
      setProcessingId(vendorId);
      await api.post(`/admin/vendors/${vendorId}/reject`, { reason });
      toast.success('Vendor rejected');
      fetchPendingVendors();
    } catch (error: any) {
      console.error('Error rejecting vendor:', error);
      toast.error(error.response?.data?.message || 'Failed to reject vendor');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Approvals</h1>
          <p className="text-gray-600">Review and approve pending vendor applications</p>
        </div>

        {vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No pending vendor approvals</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Business Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Owner</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Applied On</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{vendor.businessName}</p>
                          {vendor.businessDescription && (
                            <p className="text-sm text-gray-500 line-clamp-1">{vendor.businessDescription}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{vendor.user.name}</td>
                      <td className="py-4 px-6 text-gray-600">{vendor.user.email}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            disabled={processingId === vendor.id}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(vendor.id)}
                            disabled={processingId === vendor.id}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

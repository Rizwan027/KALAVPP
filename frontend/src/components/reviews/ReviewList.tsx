'use client';

import { useEffect, useState } from 'react';
import { FiStar, FiUser } from 'react-icons/fi';
import api from '@/lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ReviewListProps {
  productId?: string;
  serviceId?: string;
  refresh?: number;
}

export default function ReviewList({ productId, serviceId, refresh }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, serviceId, refresh]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (serviceId) params.append('serviceId', serviceId);

      const response = await api.get(`/reviews?${params.toString()}`);
      setReviews(response.data.data.reviews);
      setStatistics(response.data.data.statistics);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Rating Summary */}
      {statistics && statistics.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900 mb-2">
                {statistics.avgRating.toFixed(1)}
              </p>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(statistics.avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{statistics.total} reviews</p>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${
                          statistics.total > 0
                            ? (statistics.distribution[star] / statistics.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {statistics.distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-5 h-5 text-gray-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{review.user.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

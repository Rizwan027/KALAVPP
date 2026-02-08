'use client';

import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId?: string;
  serviceId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, serviceId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        productId,
        serviceId,
        rating,
        comment,
      });

      toast.success('Review submitted successfully!');
      setRating(5);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <FiStar
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating} {rating === 1 ? 'star' : 'stars'}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field"
          rows={4}
          placeholder="Share your experience with this product/service..."
          required
          minLength={10}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 characters (minimum 10)
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || comment.length < 10}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

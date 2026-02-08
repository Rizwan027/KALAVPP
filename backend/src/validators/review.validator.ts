import { z } from 'zod';

/**
 * Review validation schemas
 */

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID').optional(),
    serviceId: z.string().uuid('Invalid service ID').optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be at most 1000 characters'),
  }).refine(
    (data) => (data.productId && !data.serviceId) || (!data.productId && data.serviceId),
    {
      message: 'Either productId or serviceId must be provided, but not both',
    }
  ),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10).max(1000).optional(),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

export const getReviewsSchema = z.object({
  query: z.object({
    productId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

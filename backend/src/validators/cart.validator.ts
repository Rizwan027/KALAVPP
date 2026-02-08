import { z } from 'zod';

/**
 * Cart validation schemas
 */

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID').optional(),
    serviceId: z.string().uuid('Invalid service ID').optional(),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  }).refine(
    (data) => (data.productId && !data.serviceId) || (!data.productId && data.serviceId),
    {
      message: 'Either productId or serviceId must be provided, but not both',
    }
  ),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid cart item ID'),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid cart item ID'),
  }),
});

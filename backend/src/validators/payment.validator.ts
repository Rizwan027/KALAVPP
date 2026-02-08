import { z } from 'zod';

/**
 * Payment validation schemas
 */

export const createPaymentIntentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
});

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })).min(1),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  }),
});

export const handleWebhookSchema = z.object({
  body: z.any(),
  headers: z.object({
    'stripe-signature': z.string(),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string(),
    orderId: z.string().uuid(),
  }),
});

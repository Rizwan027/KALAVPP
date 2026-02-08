import { z } from 'zod';

/**
 * Order validation schemas
 */

const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
}).refine(
  (data) => (data.productId && !data.serviceId) || (!data.productId && data.serviceId),
  {
    message: 'Either productId or serviceId must be provided, but not both',
  }
);

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    shippingAddress: z.object({
      fullName: z.string().min(2),
      addressLine1: z.string().min(5),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(3),
      country: z.string().min(2),
      phone: z.string().min(10),
    }),
    billingAddress: z.object({
      fullName: z.string().min(2),
      addressLine1: z.string().min(5),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(3),
      country: z.string().min(2),
      phone: z.string().min(10),
    }).optional(),
    paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'CREDIT_CARD']),
    notes: z.string().optional(),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    notes: z.string().optional(),
  }),
});

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

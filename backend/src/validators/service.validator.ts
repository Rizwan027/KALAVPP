import { z } from 'zod';

/**
 * Service validation schemas
 */

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    categoryId: z.string().uuid('Invalid category ID'),
    duration: z.string().optional(), // e.g., "2 hours", "1 week"
    deliveryTime: z.string().optional(), // e.g., "3 days", "1 week"
    requirements: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    duration: z.string().optional(),
    deliveryTime: z.string().optional(),
    requirements: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
});

export const deleteServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
});

export const listServicesSchema = z.object({
  query: z.object({
    page: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 1),
    limit: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 20),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minPrice: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : undefined),
    maxPrice: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : undefined),
    vendorId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'price', 'title', 'popularity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).partial(),
});

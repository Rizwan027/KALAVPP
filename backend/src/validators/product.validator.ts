import { z } from 'zod';

/**
 * Product validation schemas
 */

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    categoryId: z.string().uuid('Invalid category ID'),
    type: z.enum(['PHYSICAL', 'DIGITAL'], {
      message: 'Type must be PHYSICAL or DIGITAL',
    }),
    stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').optional(),
    sku: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    type: z.enum(['PHYSICAL', 'DIGITAL']).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    sku: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 1),
    limit: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 20),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['PHYSICAL', 'DIGITAL']).optional(),
    minPrice: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : undefined),
    maxPrice: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : undefined),
    vendorId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'price', 'title', 'popularity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).partial(),
});

import { z } from 'zod';

/**
 * Category validation schemas
 */

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().optional(),
    parentId: z.string().optional().nullable(),
    imageUrl: z.string().optional(),
    type: z.enum(['PRODUCT', 'SERVICE']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    parentId: z.string().optional().nullable(),
    imageUrl: z.string().optional(),
    type: z.enum(['PRODUCT', 'SERVICE']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class CategoryService {
  /**
   * Create a new category (Admin only)
   */
  static async createCategory(data: any) {
    // If parentId is provided, verify parent category exists
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        throw ApiError.notFound('Parent category not found');
      }
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      throw ApiError.badRequest('Category with this name already exists');
    }

    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || slug,
        type: data.type || 'PRODUCT',
        description: data.description,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return category;
  }

  /**
   * Get all categories
   */
  static async getAllCategories(includeInactive = false) {
    const where: Prisma.CategoryWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
        },
        _count: {
          select: {
            products: true,
            services: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
        },
        _count: {
          select: {
            products: true,
            services: true,
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  /**
   * Update category (Admin only)
   */
  static async updateCategory(categoryId: string, data: any) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw ApiError.notFound('Category not found');
    }

    // If name is being updated, check for duplicates
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: 'insensitive',
          },
          id: {
            not: categoryId,
          },
        },
      });

      if (duplicateCategory) {
        throw ApiError.badRequest('Category with this name already exists');
      }
    }

    // If parentId is being updated, verify it exists and prevent circular reference
    if (data.parentId !== undefined) {
      if (data.parentId === categoryId) {
        throw ApiError.badRequest('Category cannot be its own parent');
      }

      if (data.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: data.parentId },
        });

        if (!parentCategory) {
          throw ApiError.notFound('Parent category not found');
        }

        // Check if the parent is a child of this category (prevent circular reference)
        if (parentCategory.parentId === categoryId) {
          throw ApiError.badRequest('Cannot create circular category reference');
        }
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return updatedCategory;
  }

  /**
   * Delete category (Admin only)
   * Soft delete by setting isActive to false
   */
  static async deleteCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
            services: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check if category has products or services
    if (category._count.products > 0 || category._count.services > 0) {
      throw ApiError.badRequest(
        'Cannot delete category with existing products or services. Please reassign them first.'
      );
    }

    // Check if category has children
    if (category._count.children > 0) {
      throw ApiError.badRequest(
        'Cannot delete category with subcategories. Please delete or reassign them first.'
      );
    }

    // Soft delete
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: false,
      },
    });

    return { message: 'Category deleted successfully' };
  }

  /**
   * Get category tree (hierarchical structure)
   */
  static async getCategoryTree() {
    // Get all active root categories (no parent)
    const rootCategories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
            },
            _count: {
              select: {
                products: true,
                services: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            services: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return rootCategories;
  }
}

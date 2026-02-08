import { PrismaClient, ProductType, Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(vendorId: string, data: any) {
    // Verify vendor exists and is approved
    const vendor = await prisma.vendorProfile.findFirst({
      where: {
        userId: vendorId,
        approvalStatus: 'APPROVED',
      },
    });

    if (!vendor) {
      throw ApiError.forbidden('Only approved vendors can create products');
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Generate slug from title
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Create product
    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug || slug,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        vendorId: vendor.id,
        type: data.type as ProductType,
        stockQuantity: data.stockQuantity || (data.type === 'DIGITAL' ? null : 0),
        sku: data.sku,
        tags: data.tags || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return product;
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string, includeInactive = false) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
        digitalAssets: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (!includeInactive && !product.isActive) {
      throw ApiError.notFound('Product not found');
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    };
  }

  /**
   * List products with filters and pagination
   */
  static async listProducts(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      type,
      minPrice,
      maxPrice,
      vendorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type as ProductType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (vendorId) {
      where.vendor = {
        userId: vendorId,
      };
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'popularity') {
      // For popularity, we'll order by review count (approximation)
      orderBy = { reviews: { _count: 'desc' } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          images: {
            take: 1,
            orderBy: {
              displayOrder: 'asc',
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Add avg rating to each product
    const productsWithRatings = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });

    return {
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update product
   */
  static async updateProduct(productId: string, vendorId: string, data: any) {
    // Check if product exists and belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendor: {
          userId: vendorId,
        },
      },
      include: {
        vendor: true,
      },
    });

    if (!existingProduct) {
      throw ApiError.notFound('Product not found or you do not have permission to update it');
    }

    // If category is being updated, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw ApiError.notFound('Category not found');
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        type: data.type as ProductType | undefined,
        stockQuantity: data.stockQuantity,
        sku: data.sku,
        tags: data.tags,
        isActive: data.isActive,
      },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        images: true,
      },
    });

    return updatedProduct;
  }

  /**
   * Delete product (soft delete by setting isActive to false)
   */
  static async deleteProduct(productId: string, vendorId: string) {
    // Check if product exists and belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendor: {
          userId: vendorId,
        },
      },
    });

    if (!existingProduct) {
      throw ApiError.notFound('Product not found or you do not have permission to delete it');
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
      },
    });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get vendor's products
   */
  static async getVendorProducts(vendorId: string, filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      includeInactive = true,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      vendor: {
        userId: vendorId,
      },
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          images: {
            take: 1,
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithStats = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });

    return {
      products: productsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

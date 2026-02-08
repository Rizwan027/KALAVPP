import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class ServiceService {
  /**
   * Create a new service
   */
  static async createService(vendorId: string, data: any) {
    // Verify vendor exists and is approved
    const vendor = await prisma.vendorProfile.findFirst({
      where: {
        userId: vendorId,
        approvalStatus: 'APPROVED',
      },
    });

    if (!vendor) {
      throw ApiError.forbidden('Only approved vendors can create services');
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
    
    // Create service
    const service = await prisma.service.create({
      data: {
        title: data.title,
        slug: data.slug || slug,
        description: data.description,
        serviceType: data.serviceType || 'COMMISSION',
        price: data.price,
        categoryId: data.categoryId,
        vendorId: vendor.id,
        duration: data.duration,
        deliveryTime: data.deliveryTime,
        requirements: data.requirements,
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

    return service;
  }

  /**
   * Get service by ID
   */
  static async getServiceById(serviceId: string, includeInactive = false) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
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

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    if (!includeInactive && !service.isActive) {
      throw ApiError.notFound('Service not found');
    }

    // Calculate average rating
    const avgRating = service.reviews.length > 0
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
      : 0;

    return {
      ...service,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: service.reviews.length,
    };
  }

  /**
   * List services with filters and pagination
   */
  static async listServices(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      vendorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
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
    let orderBy: Prisma.ServiceOrderByWithRelationInput = {};
    if (sortBy === 'popularity') {
      orderBy = { reviews: { _count: 'desc' } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Execute queries
    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
      prisma.service.count({ where }),
    ]);

    // Add avg rating to each service
    const servicesWithRatings = services.map((service) => {
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
        : 0;

      return {
        ...service,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: service.reviews.length,
      };
    });

    return {
      services: servicesWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update service
   */
  static async updateService(serviceId: string, vendorId: string, data: any) {
    // Check if service exists and belongs to vendor
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendor: {
          userId: vendorId,
        },
      },
      include: {
        vendor: true,
      },
    });

    if (!existingService) {
      throw ApiError.notFound('Service not found or you do not have permission to update it');
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

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        duration: data.duration,
        deliveryTime: data.deliveryTime,
        requirements: data.requirements,
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

    return updatedService;
  }

  /**
   * Delete service (soft delete by setting isActive to false)
   */
  static async deleteService(serviceId: string, vendorId: string) {
    // Check if service exists and belongs to vendor
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendor: {
          userId: vendorId,
        },
      },
    });

    if (!existingService) {
      throw ApiError.notFound('Service not found or you do not have permission to delete it');
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        isActive: false,
      },
    });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Get vendor's services
   */
  static async getVendorServices(vendorId: string, filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      includeInactive = true,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      vendor: {
        userId: vendorId,
      },
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
      prisma.service.count({ where }),
    ]);

    const servicesWithStats = services.map((service) => {
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
        : 0;

      return {
        ...service,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: service.reviews.length,
      };
    });

    return {
      services: servicesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

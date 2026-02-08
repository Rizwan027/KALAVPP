import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class ReviewService {
  /**
   * Create a review
   */
  static async createReview(userId: string, data: any) {
    const { productId, serviceId, orderId, rating, comment } = data;

    // Check if user has purchased the product/service
    if (productId) {
      const hasPurchased = await prisma.order.findFirst({
        where: {
          userId,
          status: 'DELIVERED',
          items: {
            some: {
              productId,
            },
          },
        },
      });

      if (!hasPurchased) {
        throw ApiError.badRequest('You can only review products you have purchased');
      }

      // Check if user already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingReview) {
        throw ApiError.badRequest('You have already reviewed this product');
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw ApiError.notFound('Product not found');
      }
    }

    if (serviceId) {
      const hasPurchased = await prisma.order.findFirst({
        where: {
          userId,
          status: 'DELIVERED',
          items: {
            some: {
              serviceId,
            },
          },
        },
      });

      if (!hasPurchased) {
        throw ApiError.badRequest('You can only review services you have purchased');
      }

      // Check if user already reviewed this service
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          serviceId,
        },
      });

      if (existingReview) {
        throw ApiError.badRequest('You have already reviewed this service');
      }

      // Verify service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw ApiError.notFound('Service not found');
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: productId || null,
        serviceId: serviceId || null,
        orderId: orderId || '',
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Get reviews by product or service
   */
  static async getReviews(filters: any = {}) {
    const {
      productId,
      serviceId,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      reviews,
      statistics: {
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution: ratingDistribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get review by ID
   */
  static async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        images: true,
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    return review;
  }

  /**
   * Update review
   */
  static async updateReview(reviewId: string, userId: string, data: any) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found or you do not have permission to update it');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedReview;
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found or you do not have permission to delete it');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
            },
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
            },
          },
        },
      },
    });

    return reviews;
  }
}

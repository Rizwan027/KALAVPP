import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class VendorService {
  /**
   * Get vendor dashboard statistics
   */
  static async getDashboardStats(userId: string) {
    // Get vendor profile
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { vendorId: vendor.id },
    });

    // Get active products
    const activeProducts = await prisma.product.count({
      where: {
        vendorId: vendor.id,
        isActive: true,
      },
    });

    // Get total services
    const totalServices = await prisma.service.count({
      where: { vendorId: vendor.id },
    });

    // Get active services
    const activeServices = await prisma.service.count({
      where: {
        vendorId: vendor.id,
        isActive: true,
      },
    });

    // Get total orders (orders containing vendor's items)
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            OR: [
              { product: { vendorId: vendor.id } },
              { service: { vendorId: vendor.id } },
            ],
          },
        },
      },
      include: {
        items: {
          where: {
            OR: [
              { product: { vendorId: vendor.id } },
              { service: { vendorId: vendor.id } },
            ],
          },
        },
      },
    });

    const totalOrders = orders.length;

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      const orderRevenue = order.items.reduce((itemSum, item) => {
        return itemSum + Number(item.subtotal);
      }, 0);
      return sum + orderRevenue;
    }, 0);

    // Get pending orders
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length;

    // Get recent orders
    const recentOrders = orders.slice(0, 5);

    // Get total reviews
    const totalReviews = await prisma.review.count({
      where: {
        OR: [
          { product: { vendorId: vendor.id } },
          { service: { vendorId: vendor.id } },
        ],
      },
    });

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { product: { vendorId: vendor.id } },
          { service: { vendorId: vendor.id } },
        ],
      },
      select: {
        rating: true,
      },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
      },
      services: {
        total: totalServices,
        active: activeServices,
        inactive: totalServices - activeServices,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: orders.filter(o => o.status === 'DELIVERED').length,
      },
      revenue: {
        total: totalRevenue,
        currency: 'USD',
      },
      reviews: {
        total: totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
    };
  }

  /**
   * Get vendor profile
   */
  static async getVendorProfile(userId: string) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    return vendor;
  }

  /**
   * Update vendor profile
   */
  static async updateVendorProfile(userId: string, data: any) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: {
        businessName: data.businessName,
        businessDescription: data.businessDescription,
        businessAddress: data.businessAddress,
        taxId: data.taxId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedVendor;
  }

  /**
   * Get vendor earnings summary
   */
  static async getEarningsSummary(userId: string) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    // Get all completed orders
    const orders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        items: {
          some: {
            OR: [
              { product: { vendorId: vendor.id } },
              { service: { vendorId: vendor.id } },
            ],
          },
        },
      },
      include: {
        items: {
          where: {
            OR: [
              { product: { vendorId: vendor.id } },
              { service: { vendorId: vendor.id } },
            ],
          },
        },
      },
    });

    // Calculate total earnings
    const totalEarnings = orders.reduce((sum, order) => {
      const orderEarnings = order.items.reduce((itemSum, item) => {
        return itemSum + Number(item.subtotal);
      }, 0);
      return sum + orderEarnings;
    }, 0);

    // Platform commission (e.g., 10%)
    const commissionRate = parseFloat(process.env.STRIPE_COMMISSION_RATE || '10') / 100;
    const platformCommission = totalEarnings * commissionRate;
    const netEarnings = totalEarnings - platformCommission;

    // Get payouts
    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalPaidOut = payouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, payout) => sum + Number(payout.amount), 0);

    const pendingPayout = netEarnings - totalPaidOut;

    return {
      totalEarnings,
      platformCommission,
      netEarnings,
      totalPaidOut,
      pendingPayout,
      commissionRate: commissionRate * 100,
      currency: 'USD',
      recentPayouts: payouts,
    };
  }

  /**
   * Request payout
   */
  static async requestPayout(userId: string, amount: number) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    // Check available balance
    const earnings = await this.getEarningsSummary(userId);

    if (amount > earnings.pendingPayout) {
      throw ApiError.badRequest(
        `Insufficient balance. Available: $${earnings.pendingPayout.toFixed(2)}`
      );
    }

    // Create payout request
    const payout = await prisma.vendorPayout.create({
      data: {
        vendorId: vendor.id,
        amount,
        currency: 'USD',
        status: 'PENDING',
        payoutMethod: 'BANK_TRANSFER',
      },
    });

    return payout;
  }
}

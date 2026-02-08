import { Prisma, UserRole, VendorApprovalStatus } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class AdminService {
  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats() {
    // Get user counts by role
    const [totalUsers, totalVendors, totalCustomers, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    // Get vendor approval stats
    const [pendingVendors, approvedVendors, rejectedVendors] = await Promise.all([
      prisma.vendorProfile.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.vendorProfile.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.vendorProfile.count({ where: { approvalStatus: 'REJECTED' } }),
    ]);

    // Get product and service counts
    const [totalProducts, activeProducts, totalServices, activeServices] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
    ]);

    // Get order stats
    const orders = await prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

    // Get category count
    const totalCategories = await prisma.category.count();

    // Get review count
    const totalReviews = await prisma.review.count();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const recentOrders = orders.filter(
      o => new Date(o.createdAt) >= sevenDaysAgo
    ).length;

    return {
      users: {
        total: totalUsers,
        vendors: totalVendors,
        customers: totalCustomers,
        admins: totalAdmins,
        recentSignups: recentUsers,
      },
      vendors: {
        pending: pendingVendors,
        approved: approvedVendors,
        rejected: rejectedVendors,
        total: pendingVendors + approvedVendors + rejectedVendors,
      },
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
        completed: completedOrders,
        recent: recentOrders,
      },
      revenue: {
        total: totalRevenue,
        currency: 'USD',
      },
      categories: {
        total: totalCategories,
      },
      reviews: {
        total: totalReviews,
      },
    };
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      role,
      search,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as UserRole;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          vendorProfile: {
            select: {
              approvalStatus: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user status
   */
  static async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get pending vendor approvals
   */
  static async getPendingVendors(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: {
          approvalStatus: 'PENDING',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.vendorProfile.count({
        where: { approvalStatus: 'PENDING' },
      }),
    ]);

    return {
      vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve vendor
   */
  static async approveVendor(vendorId: string) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    if (vendor.approvalStatus !== 'PENDING') {
      throw ApiError.badRequest('Vendor is not in pending status');
    }

    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send approval email to vendor

    return updatedVendor;
  }

  /**
   * Reject vendor
   */
  static async rejectVendor(vendorId: string, reason?: string) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    if (vendor.approvalStatus !== 'PENDING') {
      throw ApiError.badRequest('Vendor is not in pending status');
    }

    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send rejection email to vendor

    return updatedVendor;
  }

  /**
   * Get all orders (Admin view)
   */
  static async getAllOrders(filters: any = {}) {
    const result = await prisma.order.findMany({
      where: filters.status ? { status: filters.status } : {},
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.skip || 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                vendor: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
            service: {
              select: {
                title: true,
                vendor: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    const total = await prisma.order.count({
      where: filters.status ? { status: filters.status } : {},
    });

    return {
      orders: result,
      pagination: {
        total,
        page: Math.floor((filters.skip || 0) / (filters.limit || 50)) + 1,
        totalPages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  /**
   * Get platform analytics
   */
  static async getPlatformAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get orders within period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true,
      },
    });

    // Calculate revenue trend
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

    // Get new users in period
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get new products/services in period
    const [newProducts, newServices] = await Promise.all([
      prisma.product.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.service.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    return {
      period,
      startDate,
      endDate: now,
      metrics: {
        revenue,
        orders: orders.length,
        completedOrders,
        newUsers,
        newProducts,
        newServices,
        avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
      },
    };
  }
}

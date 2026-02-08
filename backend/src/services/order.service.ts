import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class OrderService {
  /**
   * Create a new order from cart or direct items
   */
  static async createOrder(userId: string, data: any) {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = data;

    // Validate all items exist and are available
    for (const item of items) {
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Product ${item.productId} is not available`);
        }

        // Check stock for physical products
        if (product.type === 'PHYSICAL' && product.stockQuantity !== null) {
          if (product.stockQuantity < item.quantity) {
            throw ApiError.badRequest(`Insufficient stock for ${product.title}`);
          }
        }
      }

      if (item.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
        });

        if (!service || !service.isActive) {
          throw ApiError.badRequest(`Service ${item.serviceId} is not available`);
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Get vendor info for the item
      let vendorId = '';
      let title = '';
      let commissionRate = 10;

      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { vendor: true },
        });
        vendorId = product?.vendorId || '';
        title = product?.title || '';
        commissionRate = Number(product?.vendor?.commissionRate || 10);
      } else if (item.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          include: { vendor: true },
        });
        vendorId = service?.vendorId || '';
        title = service?.title || '';
        commissionRate = Number(service?.vendor?.commissionRate || 10);
      }

      const commissionAmount = (itemTotal * commissionRate) / 100;
      const vendorEarnings = itemTotal - commissionAmount;

      orderItems.push({
        productId: item.productId || null,
        serviceId: item.serviceId || null,
        vendorId,
        itemType: item.productId ? 'PRODUCT' : 'SERVICE',
        title,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: itemTotal,
        commissionRate,
        commissionAmount,
      });
    }

    // For now, no tax or shipping calculation (can be added later)
    const taxAmount = 0;
    const shippingAmount = 0;
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          status: 'PENDING',
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress || shippingAddress) as any,
          notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  vendor: {
                    include: {
                      user: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
              service: {
                include: {
                  images: { take: 1 },
                  vendor: {
                    include: {
                      user: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Update stock for physical products
      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product && product.type === 'PHYSICAL' && product.stockQuantity !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: product.stockQuantity - item.quantity,
              },
            });
          }
        }
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    return order;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string, isAdmin = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
              include: {
                images: { take: 1 },
                vendor: {
                  include: {
                    user: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
            service: {
              include: {
                images: { take: 1 },
                vendor: {
                  include: {
                    user: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
        payment: true,
        invoice: true,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Check authorization (user can only view their own orders unless admin)
    if (!isAdmin && userId && order.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    return order;
  }

  /**
   * List user's orders
   */
  static async listUserOrders(userId: string, filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId,
    };

    if (status) {
      where.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
              service: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List vendor's orders (orders containing vendor's products/services)
   */
  static async listVendorOrders(vendorId: string, filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      status,
    } = filters;

    const skip = (page - 1) * limit;

    // Get vendor profile
    const vendor = await prisma.vendorProfile.findFirst({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw ApiError.notFound('Vendor profile not found');
    }

    // Find orders that contain vendor's products or services
    const where: Prisma.OrderWhereInput = {
      items: {
        some: {
          OR: [
            {
              product: {
                vendorId: vendor.id,
              },
            },
            {
              service: {
                vendorId: vendor.id,
              },
            },
          ],
        },
      },
    };

    if (status) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
              service: {
                include: {
                  images: { take: 1 },
                },
              },
            },
            // Only include items that belong to this vendor
            where: {
              OR: [
                {
                  product: {
                    vendorId: vendor.id,
                  },
                },
                {
                  service: {
                    vendorId: vendor.id,
                  },
                },
              ],
            },
          },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status (Admin or Vendor)
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus, userId: string, isAdmin = false, notes?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // If not admin, check if user is a vendor for this order
    if (!isAdmin) {
      const vendor = await prisma.vendorProfile.findFirst({
        where: { userId },
      });

      if (!vendor) {
        throw ApiError.forbidden('You do not have permission to update this order');
      }

      // Check if any order items belong to this vendor
      const hasVendorItems = order.items.some(
        (item) =>
          (item.product && item.product.vendorId === vendor.id) ||
          (item.service && item.service.vendorId === vendor.id)
      );

      if (!hasVendorItems) {
        throw ApiError.forbidden('You do not have permission to update this order');
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: notes || order.notes,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
            service: {
              include: {
                images: { take: 1 },
              },
            },
          },
        },
        payment: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Get all orders (Admin only)
   */
  static async listAllOrders(filters: any = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
              service: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

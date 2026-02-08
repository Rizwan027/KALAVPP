import ApiError from '../utils/ApiError';
import prisma from '../config/database';

export class CartService {
  /**
   * Get user's cart
   */
  static async getCart(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                displayOrder: 'asc',
              },
            },
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
          },
        },
        service: {
          include: {
            images: {
              take: 1,
              orderBy: {
                displayOrder: 'asc',
              },
            },
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product ? Number(item.product.price) : Number(item.service!.price);
      return sum + price * item.quantity;
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems,
      summary: {
        subtotal,
        totalItems,
        itemCount: cartItems.length,
      },
    };
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, data: any) {
    const { productId, serviceId, quantity } = data;

    // Verify product or service exists and is active
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw ApiError.notFound('Product not found');
      }

      if (!product.isActive) {
        throw ApiError.badRequest('Product is not available');
      }

      // Check stock for physical products
      if (product.type === 'PHYSICAL' && product.stockQuantity !== null) {
        if (product.stockQuantity < quantity) {
          throw ApiError.badRequest(`Only ${product.stockQuantity} items available in stock`);
        }
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        // Check stock again for new quantity
        if (product.type === 'PHYSICAL' && product.stockQuantity !== null) {
          if (product.stockQuantity < newQuantity) {
            throw ApiError.badRequest(`Only ${product.stockQuantity} items available in stock`);
          }
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
          },
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
          },
        });

        return updatedItem;
      }

      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      });

      return cartItem;
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw ApiError.notFound('Service not found');
      }

      if (!service.isActive) {
        throw ApiError.badRequest('Service is not available');
      }

      // Check if service already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          serviceId,
        },
      });

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
          include: {
            service: {
              include: {
                images: { take: 1 },
              },
            },
          },
        });

        return updatedItem;
      }

      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId,
          serviceId,
          quantity,
        },
        include: {
          service: {
            include: {
              images: { take: 1 },
            },
          },
        },
      });

      return cartItem;
    }

    throw ApiError.badRequest('Either productId or serviceId must be provided');
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        product: true,
        service: true,
      },
    });

    if (!cartItem) {
      throw ApiError.notFound('Cart item not found');
    }

    // Check stock if it's a physical product
    if (cartItem.product && cartItem.product.type === 'PHYSICAL' && cartItem.product.stockQuantity !== null) {
      if (cartItem.product.stockQuantity < quantity) {
        throw ApiError.badRequest(`Only ${cartItem.product.stockQuantity} items available in stock`);
      }
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
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
    });

    return updatedItem;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, cartItemId: string) {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      throw ApiError.notFound('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { message: 'Item removed from cart' };
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { message: 'Cart cleared successfully' };
  }
}

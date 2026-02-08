import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class CartController {
  /**
   * Get user's cart
   * GET /api/v1/cart
   */
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const cart = await CartService.getCart(req.user.id);
      return ApiResponse.success(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const cartItem = await CartService.addToCart(req.user.id, req.body);
      return ApiResponse.created(res, cartItem, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item
   * PUT /api/v1/cart/items/:id
   */
  static async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const cartItem = await CartService.updateCartItem(
        req.user.id,
        req.params.id,
        req.body.quantity
      );
      return ApiResponse.success(res, cartItem, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:id
   */
  static async removeFromCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await CartService.removeFromCart(req.user.id, req.params.id);
      return ApiResponse.success(res, result, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/v1/cart
   */
  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await CartService.clearCart(req.user.id);
      return ApiResponse.success(res, result, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

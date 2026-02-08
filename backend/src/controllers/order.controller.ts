import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class OrderController {
  /**
   * Create new order
   * POST /api/v1/orders
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const order = await OrderService.createOrder(req.user.id, req.body);
      return ApiResponse.created(res, order, 'Order created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const isAdmin = req.user.role === 'ADMIN';
      const order = await OrderService.getOrderById(req.params.id, req.user.id, isAdmin);
      return ApiResponse.success(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List user's orders
   * GET /api/v1/orders
   */
  static async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await OrderService.listUserOrders(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   * PUT /api/v1/orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const isAdmin = req.user.role === 'ADMIN';
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        req.body.status,
        req.user.id,
        isAdmin,
        req.body.notes
      );
      return ApiResponse.success(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';
import { ProductService } from '../services/product.service';
import { ServiceService } from '../services/service.service';
import { OrderService } from '../services/order.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class VendorController {
  /**
   * Get vendor dashboard
   * GET /api/v1/vendors/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const stats = await VendorService.getDashboardStats(req.user.id);
      return ApiResponse.success(res, stats, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor profile
   * GET /api/v1/vendors/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const profile = await VendorService.getVendorProfile(req.user.id);
      return ApiResponse.success(res, profile, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vendor profile
   * PUT /api/v1/vendors/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const profile = await VendorService.updateVendorProfile(req.user.id, req.body);
      return ApiResponse.success(res, profile, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor products
   * GET /api/v1/vendors/products
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ProductService.getVendorProducts(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Products retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor services
   * GET /api/v1/vendors/services
   */
  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ServiceService.getVendorServices(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Services retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor orders
   * GET /api/v1/vendors/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await OrderService.listVendorOrders(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor earnings
   * GET /api/v1/vendors/earnings
   */
  static async getEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const earnings = await VendorService.getEarningsSummary(req.user.id);
      return ApiResponse.success(res, earnings, 'Earnings retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request payout
   * POST /api/v1/vendors/payout
   */
  static async requestPayout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const payout = await VendorService.requestPayout(req.user.id, req.body.amount);
      return ApiResponse.created(res, payout, 'Payout requested');
    } catch (error) {
      next(error);
    }
  }
}

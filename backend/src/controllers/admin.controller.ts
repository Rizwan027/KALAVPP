import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import ApiResponse from '../utils/ApiResponse';

export class AdminController {
  /**
   * Get admin dashboard stats
   * GET /api/v1/admin/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      return ApiResponse.success(res, stats, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users
   * GET /api/v1/admin/users
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllUsers(req.query);
      return ApiResponse.success(res, result, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status
   * PUT /api/v1/admin/users/:userId/status
   */
  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.updateUserStatus(
        req.params.userId,
        req.body.isActive
      );
      return ApiResponse.success(res, user, 'User status updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending vendor approvals
   * GET /api/v1/admin/vendors/pending
   */
  static async getPendingVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getPendingVendors(req.query);
      return ApiResponse.success(res, result, 'Pending vendors retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve vendor
   * POST /api/v1/admin/vendors/:vendorId/approve
   */
  static async approveVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await AdminService.approveVendor(req.params.vendorId);
      return ApiResponse.success(res, vendor, 'Vendor approved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject vendor
   * POST /api/v1/admin/vendors/:vendorId/reject
   */
  static async rejectVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await AdminService.rejectVendor(
        req.params.vendorId,
        req.body.reason
      );
      return ApiResponse.success(res, vendor, 'Vendor rejected');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders
   * GET /api/v1/admin/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllOrders(req.query);
      return ApiResponse.success(res, result, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get platform analytics
   * GET /api/v1/admin/analytics
   */
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as any) || 'month';
      const analytics = await AdminService.getPlatformAnalytics(period);
      return ApiResponse.success(res, analytics, 'Analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

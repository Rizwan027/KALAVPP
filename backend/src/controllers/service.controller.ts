import { Request, Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class ServiceController {
  /**
   * Create new service
   * POST /api/v1/services
   */
  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const service = await ServiceService.createService(req.user.id, req.body);
      return ApiResponse.created(res, service, 'Service created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/v1/services/:id
   */
  static async getService(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await ServiceService.getServiceById(req.params.id);
      return ApiResponse.success(res, service, 'Service retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all services
   * GET /api/v1/services
   */
  static async listServices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ServiceService.listServices(req.query);
      return ApiResponse.success(res, result, 'Services retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update service
   * PUT /api/v1/services/:id
   */
  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const service = await ServiceService.updateService(
        req.params.id,
        req.user.id,
        req.body
      );
      return ApiResponse.success(res, service, 'Service updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete service
   * DELETE /api/v1/services/:id
   */
  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ServiceService.deleteService(req.params.id, req.user.id);
      return ApiResponse.success(res, result, 'Service deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor's services
   * GET /api/v1/services/vendor/me
   */
  static async getMyServices(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ServiceService.getVendorServices(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Vendor services retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor's services by vendor ID
   * GET /api/v1/services/vendor/:vendorId
   */
  static async getVendorServices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ServiceService.getVendorServices(req.params.vendorId, {
        ...req.query,
        includeInactive: false, // Only show active services for public view
      });
      return ApiResponse.success(res, result, 'Vendor services retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

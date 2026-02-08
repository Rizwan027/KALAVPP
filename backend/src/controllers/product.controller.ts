import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class ProductController {
  /**
   * Create new product
   * POST /api/v1/products
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const product = await ProductService.createProduct(req.user.id, req.body);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return ApiResponse.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all products
   * GET /api/v1/products
   */
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.listProducts(req.query);
      return ApiResponse.success(res, result, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const product = await ProductService.updateProduct(
        req.params.id,
        req.user.id,
        req.body
      );
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ProductService.deleteProduct(req.params.id, req.user.id);
      return ApiResponse.success(res, result, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor's products
   * GET /api/v1/products/vendor/me
   */
  static async getMyProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await ProductService.getVendorProducts(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Vendor products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor's products by vendor ID
   * GET /api/v1/products/vendor/:vendorId
   */
  static async getVendorProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getVendorProducts(req.params.vendorId, {
        ...req.query,
        includeInactive: false, // Only show active products for public view
      });
      return ApiResponse.success(res, result, 'Vendor products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

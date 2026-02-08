import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class UploadController {
  /**
   * Upload product images
   * POST /api/v1/upload/product/:productId/images
   */
  static async uploadProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw ApiError.badRequest('No images provided');
      }

      const images = await UploadService.uploadProductImages(
        req.params.productId,
        req.user.id,
        req.files as Express.Multer.File[]
      );

      return ApiResponse.created(res, images, 'Images uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product image
   * DELETE /api/v1/upload/product/image/:imageId
   */
  static async deleteProductImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await UploadService.deleteProductImage(
        req.params.imageId,
        req.user.id
      );

      return ApiResponse.success(res, result, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload service images
   * POST /api/v1/upload/service/:serviceId/images
   */
  static async uploadServiceImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw ApiError.badRequest('No images provided');
      }

      const images = await UploadService.uploadServiceImages(
        req.params.serviceId,
        req.user.id,
        req.files as Express.Multer.File[]
      );

      return ApiResponse.created(res, images, 'Images uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete service image
   * DELETE /api/v1/upload/service/image/:imageId
   */
  static async deleteServiceImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await UploadService.deleteServiceImage(
        req.params.imageId,
        req.user.id
      );

      return ApiResponse.success(res, result, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload digital asset
   * POST /api/v1/upload/product/:productId/digital-asset
   */
  static async uploadDigitalAsset(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      if (!req.file) {
        throw ApiError.badRequest('No file provided');
      }

      const asset = await UploadService.uploadDigitalAsset(
        req.params.productId,
        req.user.id,
        req.file
      );

      return ApiResponse.created(res, asset, 'Digital asset uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete digital asset
   * DELETE /api/v1/upload/digital-asset/:assetId
   */
  static async deleteDigitalAsset(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await UploadService.deleteDigitalAsset(
        req.params.assetId,
        req.user.id
      );

      return ApiResponse.success(res, result, 'Digital asset deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

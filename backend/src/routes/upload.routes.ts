import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { isVendorOrAdmin } from '../middlewares/authorize';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../config/upload';

const router = Router();

// All upload routes require vendor or admin authentication
router.use(authenticate);
router.use(isVendorOrAdmin);

/**
 * Upload product images
 * POST /api/v1/upload/product/:productId/images
 */
router.post(
  '/product/:productId/images',
  upload.array('images', 10), // Max 10 images
  UploadController.uploadProductImages
);

/**
 * Delete product image
 * DELETE /api/v1/upload/product/image/:imageId
 */
router.delete(
  '/product/image/:imageId',
  UploadController.deleteProductImage
);

/**
 * Upload service images
 * POST /api/v1/upload/service/:serviceId/images
 */
router.post(
  '/service/:serviceId/images',
  upload.array('images', 10), // Max 10 images
  UploadController.uploadServiceImages
);

/**
 * Delete service image
 * DELETE /api/v1/upload/service/image/:imageId
 */
router.delete(
  '/service/image/:imageId',
  UploadController.deleteServiceImage
);

/**
 * Upload digital asset for product
 * POST /api/v1/upload/product/:productId/digital-asset
 */
router.post(
  '/product/:productId/digital-asset',
  upload.single('digitalAsset'),
  UploadController.uploadDigitalAsset
);

/**
 * Delete digital asset
 * DELETE /api/v1/upload/digital-asset/:assetId
 */
router.delete(
  '/digital-asset/:assetId',
  UploadController.deleteDigitalAsset
);

export default router;

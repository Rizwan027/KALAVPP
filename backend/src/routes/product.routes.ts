import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate';
import { isVendorOrAdmin } from '../middlewares/authorize';
import { ProductController } from '../controllers/product.controller';
import { validateZod } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
  listProductsSchema,
} from '../validators/product.validator';

const router = Router();

// Public routes
router.get(
  '/',
  validateZod(listProductsSchema),
  ProductController.listProducts
);

router.get(
  '/:id',
  validateZod(getProductSchema),
  ProductController.getProduct
);

// Vendor-specific routes
router.get(
  '/vendor/me',
  authenticate,
  isVendorOrAdmin,
  ProductController.getMyProducts
);

router.get(
  '/vendor/:vendorId',
  ProductController.getVendorProducts
);

// Protected vendor routes
router.post(
  '/',
  authenticate,
  isVendorOrAdmin,
  validateZod(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  isVendorOrAdmin,
  validateZod(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  isVendorOrAdmin,
  validateZod(deleteProductSchema),
  ProductController.deleteProduct
);

export default router;

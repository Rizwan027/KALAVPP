import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { isVendorOrAdmin } from '../middlewares/authorize';
import { VendorController } from '../controllers/vendor.controller';

const router = Router();

// All vendor routes require authentication and vendor role
router.use(authenticate);
router.use(isVendorOrAdmin);

/**
 * Get vendor dashboard statistics
 * GET /api/v1/vendors/dashboard
 */
router.get('/dashboard', VendorController.getDashboard);

/**
 * Get vendor profile
 * GET /api/v1/vendors/profile
 */
router.get('/profile', VendorController.getProfile);

/**
 * Update vendor profile
 * PUT /api/v1/vendors/profile
 */
router.put('/profile', VendorController.updateProfile);

/**
 * Get vendor products
 * GET /api/v1/vendors/products
 */
router.get('/products', VendorController.getProducts);

/**
 * Get vendor services
 * GET /api/v1/vendors/services
 */
router.get('/services', VendorController.getServices);

/**
 * Get vendor orders
 * GET /api/v1/vendors/orders
 */
router.get('/orders', VendorController.getOrders);

/**
 * Get vendor earnings
 * GET /api/v1/vendors/earnings
 */
router.get('/earnings', VendorController.getEarnings);

/**
 * Request payout
 * POST /api/v1/vendors/payout
 */
router.post('/payout', VendorController.requestPayout);

export default router;

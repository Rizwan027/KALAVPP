import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { isAdmin } from '../middlewares/authorize';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

/**
 * Get admin dashboard statistics
 * GET /api/v1/admin/dashboard
 */
router.get('/dashboard', AdminController.getDashboard);

/**
 * Get all users
 * GET /api/v1/admin/users
 */
router.get('/users', AdminController.getUsers);

/**
 * Update user status
 * PUT /api/v1/admin/users/:userId/status
 */
router.put('/users/:userId/status', AdminController.updateUserStatus);

/**
 * Get pending vendor approvals
 * GET /api/v1/admin/vendors/pending
 */
router.get('/vendors/pending', AdminController.getPendingVendors);

/**
 * Approve vendor
 * POST /api/v1/admin/vendors/:vendorId/approve
 */
router.post('/vendors/:vendorId/approve', AdminController.approveVendor);

/**
 * Reject vendor
 * POST /api/v1/admin/vendors/:vendorId/reject
 */
router.post('/vendors/:vendorId/reject', AdminController.rejectVendor);

/**
 * Get all orders (Admin view)
 * GET /api/v1/admin/orders
 */
router.get('/orders', AdminController.getOrders);

/**
 * Get platform analytics
 * GET /api/v1/admin/analytics
 */
router.get('/analytics', AdminController.getAnalytics);

export default router;

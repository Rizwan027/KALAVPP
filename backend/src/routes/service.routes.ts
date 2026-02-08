import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate';
import { isVendorOrAdmin } from '../middlewares/authorize';
import { ServiceController } from '../controllers/service.controller';
import { validateZod } from '../middlewares/validate';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceSchema,
  deleteServiceSchema,
  listServicesSchema,
} from '../validators/service.validator';

const router = Router();

// Public routes
router.get(
  '/',
  validateZod(listServicesSchema),
  ServiceController.listServices
);

router.get(
  '/:id',
  validateZod(getServiceSchema),
  ServiceController.getService
);

// Vendor-specific routes
router.get(
  '/vendor/me',
  authenticate,
  isVendorOrAdmin,
  ServiceController.getMyServices
);

router.get(
  '/vendor/:vendorId',
  ServiceController.getVendorServices
);

// Protected vendor routes
router.post(
  '/',
  authenticate,
  isVendorOrAdmin,
  validateZod(createServiceSchema),
  ServiceController.createService
);

router.put(
  '/:id',
  authenticate,
  isVendorOrAdmin,
  validateZod(updateServiceSchema),
  ServiceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  isVendorOrAdmin,
  validateZod(deleteServiceSchema),
  ServiceController.deleteService
);

export default router;

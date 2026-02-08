import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { isAdmin } from '../middlewares/authorize';
import { CategoryController } from '../controllers/category.controller';
import { validateZod } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
} from '../validators/category.validator';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);

router.get('/tree', CategoryController.getCategoryTree);

router.get(
  '/:id',
  validateZod(getCategorySchema),
  CategoryController.getCategory
);

// Protected admin routes
router.post(
  '/',
  authenticate,
  isAdmin,
  validateZod(createCategorySchema),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  validateZod(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validateZod(deleteCategorySchema),
  CategoryController.deleteCategory
);

export default router;

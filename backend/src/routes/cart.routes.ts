import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { CartController } from '../controllers/cart.controller';
import { validateZod } from '../middlewares/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} from '../validators/cart.validator';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);

router.post(
  '/items',
  validateZod(addToCartSchema),
  CartController.addToCart
);

router.put(
  '/items/:id',
  validateZod(updateCartItemSchema),
  CartController.updateCartItem
);

router.delete(
  '/items/:id',
  validateZod(removeFromCartSchema),
  CartController.removeFromCart
);

router.delete('/', CartController.clearCart);

export default router;

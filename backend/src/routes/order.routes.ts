import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { OrderController } from '../controllers/order.controller';
import { validateZod } from '../middlewares/validate';
import {
  createOrderSchema,
  getOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
} from '../validators/order.validator';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get(
  '/',
  validateZod(listOrdersSchema),
  OrderController.listOrders
);

router.get(
  '/:id',
  validateZod(getOrderSchema),
  OrderController.getOrder
);

router.post(
  '/',
  validateZod(createOrderSchema),
  OrderController.createOrder
);

router.put(
  '/:id/status',
  validateZod(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export default router;

import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { isAdmin } from '../middlewares/authorize';
import { PaymentController } from '../controllers/payment.controller';
import { validateZod } from '../middlewares/validate';
import {
  createCheckoutSessionSchema,
  createPaymentIntentSchema,
  confirmPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

/**
 * Create Stripe checkout session
 * POST /api/v1/payments/checkout-session
 */
router.post(
  '/checkout-session',
  authenticate,
  validateZod(createCheckoutSessionSchema),
  PaymentController.createCheckoutSession
);

/**
 * Create payment intent for order
 * POST /api/v1/payments/payment-intent
 */
router.post(
  '/payment-intent',
  authenticate,
  validateZod(createPaymentIntentSchema),
  PaymentController.createPaymentIntent
);

/**
 * Confirm payment
 * POST /api/v1/payments/confirm
 */
router.post(
  '/confirm',
  authenticate,
  validateZod(confirmPaymentSchema),
  PaymentController.confirmPayment
);

/**
 * Get payment by order ID
 * GET /api/v1/payments/order/:orderId
 */
router.get(
  '/order/:orderId',
  authenticate,
  PaymentController.getPaymentByOrderId
);

/**
 * Refund payment (Admin only)
 * POST /api/v1/payments/refund/:orderId
 */
router.post(
  '/refund/:orderId',
  authenticate,
  isAdmin,
  PaymentController.refundPayment
);

/**
 * Stripe webhook endpoint
 * POST /api/v1/payments/webhook
 * Note: This should NOT have authentication middleware
 */
router.post(
  '/webhook',
  PaymentController.handleWebhook
);

export default router;

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class PaymentController {
  /**
   * Create checkout session
   * POST /api/v1/payments/checkout-session
   */
  static async createCheckoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const session = await PaymentService.createCheckoutSession(req.user.id, req.body);
      return ApiResponse.created(res, session, 'Checkout session created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create payment intent
   * POST /api/v1/payments/payment-intent
   */
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await PaymentService.createPaymentIntent(
        req.body.orderId,
        req.user.id
      );
      return ApiResponse.created(res, result, 'Payment intent created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   * POST /api/v1/payments/confirm
   */
  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const result = await PaymentService.confirmPayment(
        req.body.paymentIntentId,
        req.body.orderId
      );
      return ApiResponse.success(res, result, 'Payment confirmed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Stripe webhooks
   * POST /api/v1/payments/webhook
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        throw ApiError.badRequest('Missing stripe-signature header');
      }

      const result = await PaymentService.handleWebhook(req.body, signature);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment by order ID
   * GET /api/v1/payments/order/:orderId
   */
  static async getPaymentByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const payment = await PaymentService.getPaymentByOrderId(
        req.params.orderId,
        req.user.id
      );
      return ApiResponse.success(res, payment, 'Payment retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund payment (Admin only)
   * POST /api/v1/payments/refund/:orderId
   */
  static async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.refundPayment(
        req.params.orderId,
        req.body.amount
      );
      return ApiResponse.success(res, result, 'Payment refunded');
    } catch (error) {
      next(error);
    }
  }
}

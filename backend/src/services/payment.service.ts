import { PaymentStatus, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';
import logger from '../utils/logger';

export class PaymentService {
  /**
   * Create Stripe checkout session
   */
  static async createCheckoutSession(userId: string, data: any) {
    const { items, successUrl, cancelUrl } = data;

    // Verify items exist and calculate total
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Product ${item.productId} is not available`);
        }

        lineItems.push({
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: product.title,
              description: product.description ? product.description.substring(0, 500) : product.title,
            },
            unit_amount: Math.round(Number(product.price) * 100), // Stripe uses cents
          },
          quantity: item.quantity,
        });

        totalAmount += Number(product.price) * item.quantity;
      }

      if (item.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
        });

        if (!service || !service.isActive) {
          throw ApiError.badRequest(`Service ${item.serviceId} is not available`);
        }

        lineItems.push({
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: service.title,
              description: service.description ? service.description.substring(0, 500) : service.title,
            },
            unit_amount: Math.round(Number(service.price) * 100),
          },
          quantity: item.quantity,
        });

        totalAmount += Number(service.price) * item.quantity;
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethodTypes as any,
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || STRIPE_CONFIG.successUrl,
      cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
      customer_email: undefined, // Will be fetched from user
      metadata: {
        userId,
        items: JSON.stringify(items),
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create payment intent for an order
   */
  static async createPaymentIntent(orderId: string, userId: string) {
    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw ApiError.badRequest('Order is not in pending status');
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw ApiError.badRequest('Order already paid');
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: {
        orderId,
      },
      create: {
        orderId,
        amount: order.totalAmount,
        currency: STRIPE_CONFIG.currency,
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
      },
      update: {
        transactionId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment,
    };
  }

  /**
   * Confirm payment
   */
  static async confirmPayment(paymentIntentId: string, orderId: string) {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw ApiError.badRequest('Payment has not succeeded');
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Generate invoice
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: `INV-${Date.now()}-${order.id.substring(0, 8)}`,
        amount: order.totalAmount,
      },
    });

    return {
      payment,
      order,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(payload: any, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw ApiError.internal('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      logger.error('Webhook signature verification failed', err);
      throw ApiError.badRequest(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle checkout session completed
   */
  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const { userId, items } = session.metadata || {};

    if (!userId || !items) {
      logger.error('Missing metadata in checkout session');
      return;
    }

    // Create order from checkout session
    const parsedItems = JSON.parse(items);
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order (simplified - you may want to use OrderService)
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: 'CONFIRMED',
        subtotal: (session.amount_total || 0) / 100,
        totalAmount: (session.amount_total || 0) / 100,
        taxAmount: 0,
        shippingAmount: 0,
        items: {
          create: parsedItems.map((item: any) => ({
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            vendorId: item.vendorId || '',
            itemType: item.productId ? 'PRODUCT' : 'SERVICE',
            title: item.title || '',
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
            commissionRate: item.commissionRate || 10,
            commissionAmount: (item.price * item.quantity * (item.commissionRate || 10)) / 100,
          })),
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'COMPLETED',
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    logger.info(`Order ${order.id} created from checkout session ${session.id}`);
  }

  /**
   * Handle payment intent succeeded
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      logger.error('Missing orderId in payment intent metadata');
      return;
    }

    // Update payment status
    await prisma.payment.updateMany({
      where: {
        transactionId: paymentIntent.id,
      },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
      },
    });

    logger.info(`Payment completed for order ${orderId}`);
  }

  /**
   * Handle payment intent failed
   */
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      return;
    }

    // Update payment status
    await prisma.payment.updateMany({
      where: {
        transactionId: paymentIntent.id,
      },
      data: {
        status: 'FAILED',
      },
    });

    logger.error(`Payment failed for order ${orderId}`);
  }

  /**
   * Get payment by order ID
   */
  static async getPaymentByOrderId(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    return payment;
  }

  /**
   * Refund payment
   */
  static async refundPayment(orderId: string, amount?: number) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw ApiError.badRequest('Can only refund completed payments');
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId || undefined,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    // Update payment status
    await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'REFUNDED',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
      },
    });

    return {
      refund,
      message: 'Payment refunded successfully',
    };
  }
}

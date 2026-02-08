import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'inr',
  paymentMethodTypes: ['card', 'upi'], // Added UPI for India
  successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout`,
};

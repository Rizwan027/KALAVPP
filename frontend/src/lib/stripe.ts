import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key is not set');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

export const createCheckoutSession = async (items: any[]) => {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }
  
  // This will be called from the checkout page
  return stripe;
};

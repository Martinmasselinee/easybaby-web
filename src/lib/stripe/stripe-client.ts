import { loadStripe, Stripe } from '@stripe/stripe-js';
import { env } from '../../../env.mjs';

// Singleton pour éviter de charger Stripe plusieurs fois
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('La clé publique Stripe n\'est pas définie');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

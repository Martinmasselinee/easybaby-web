import Stripe from 'stripe';
import { env } from '@/env.mjs';

// Cette fonction initialise l'instance Stripe avec la clé secrète
export const getStripeInstance = () => {
  const stripeSecretKey = env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error('La clé secrète Stripe n\'est pas définie');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16', // Utiliser la dernière version de l'API Stripe
    appInfo: {
      name: 'EasyBaby',
      version: '1.0.0',
    },
  });
};

// Singleton pour éviter de créer plusieurs instances
let stripeInstance: Stripe | null = null;

export const stripe = () => {
  if (!stripeInstance) {
    stripeInstance = getStripeInstance();
  }
  return stripeInstance;
};

// Fonction pour créer un PaymentIntent (pré-autorisation)
export async function createPaymentIntent(amount: number, metadata: Record<string, string>) {
  try {
    const paymentIntent = await stripe().paymentIntents.create({
      amount, // en centimes
      currency: 'eur',
      capture_method: 'manual', // Ne pas capturer immédiatement, juste autoriser
      confirmation_method: 'automatic',
      metadata,
    });
    
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    return { success: false, error };
  }
}

// Fonction pour créer un SetupIntent (pour sauvegarder la méthode de paiement)
export async function createSetupIntent(metadata: Record<string, string>) {
  try {
    const setupIntent = await stripe().setupIntents.create({
      usage: 'off_session', // Pour permettre des charges ultérieures
      metadata,
    });
    
    return { success: true, setupIntent };
  } catch (error) {
    console.error('Erreur lors de la création du SetupIntent:', error);
    return { success: false, error };
  }
}

// Fonction pour charger une carte sauvegardée (pour les réclamations)
export async function chargeOffSession(
  paymentMethodId: string, 
  amount: number, 
  description: string,
  metadata: Record<string, string>
) {
  try {
    const paymentIntent = await stripe().paymentIntents.create({
      amount,
      currency: 'eur',
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
      metadata,
    });
    
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Erreur lors de la charge off-session:', error);
    return { success: false, error };
  }
}

// Fonction pour vérifier la signature d'un webhook Stripe
export const constructEventFromPayload = async (
  payload: Buffer,
  signature: string
) => {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('La clé secrète du webhook Stripe n\'est pas définie');
  }

  try {
    return stripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de la signature du webhook:', error);
    throw error;
  }
};

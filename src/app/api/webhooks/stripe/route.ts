import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return new NextResponse('Webhook signature or secret missing', { status: 400 });
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // TODO: Mettre à jour le statut de la réservation en CONFIRMED
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent for ${failedPaymentIntent.amount} failed.`);
        // TODO: Mettre à jour le statut de la réservation en CANCELLED
        break;
      case 'setup_intent.succeeded':
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log(`SetupIntent was successful!`);
        // TODO: Sauvegarder le payment method ID pour une utilisation ultérieure
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Enregistrer l'événement dans la base de données pour audit
    // TODO: Implémenter l'enregistrement dans PaymentAudit

    return new NextResponse(JSON.stringify({ received: true }));
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}

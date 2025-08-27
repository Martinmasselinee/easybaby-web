import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { constructEventFromPayload } from "@/lib/stripe/stripe-server";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";

  try {
    // Vérifier la signature du webhook
    const event = await constructEventFromPayload(
      Buffer.from(body),
      signature
    );

    // Traiter les différents types d'événements
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case "setup_intent.succeeded":
        await handleSetupIntentSucceeded(event.data.object);
        break;
        
      case "setup_intent.setup_failed":
        await handleSetupIntentFailed(event.data.object);
        break;
        
      // Autres événements à traiter selon les besoins
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 400 }
    );
  }
}

// Gestionnaire pour payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { metadata } = paymentIntent;
  
  if (!metadata?.reservationId) {
    console.error("PaymentIntent sans reservationId dans les métadonnées");
    return;
  }

  // Enregistrer l'événement dans l'audit
  await prisma.paymentAudit.create({
    data: {
      reservationId: metadata.reservationId,
      event: "payment_intent.succeeded",
      data: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      },
    },
  });
}

// Gestionnaire pour payment_intent.payment_failed
async function handlePaymentIntentFailed(paymentIntent: any) {
  const { metadata } = paymentIntent;
  
  if (!metadata?.reservationId) {
    console.error("PaymentIntent sans reservationId dans les métadonnées");
    return;
  }

  // Mettre à jour la réservation à CANCELLED
  await prisma.reservation.update({
    where: { id: metadata.reservationId },
    data: { status: ReservationStatus.CANCELLED },
  });

  // Enregistrer l'événement dans l'audit
  await prisma.paymentAudit.create({
    data: {
      reservationId: metadata.reservationId,
      event: "payment_intent.payment_failed",
      data: {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error,
      },
    },
  });
}

// Gestionnaire pour setup_intent.succeeded
async function handleSetupIntentSucceeded(setupIntent: any) {
  const { metadata } = setupIntent;
  
  if (!metadata?.reservationId) {
    console.error("SetupIntent sans reservationId dans les métadonnées");
    return;
  }

  // Enregistrer l'événement dans l'audit
  await prisma.paymentAudit.create({
    data: {
      reservationId: metadata.reservationId,
      event: "setup_intent.succeeded",
      data: {
        setupIntentId: setupIntent.id,
        paymentMethodId: setupIntent.payment_method,
      },
    },
  });
}

// Gestionnaire pour setup_intent.setup_failed
async function handleSetupIntentFailed(setupIntent: any) {
  const { metadata } = setupIntent;
  
  if (!metadata?.reservationId) {
    console.error("SetupIntent sans reservationId dans les métadonnées");
    return;
  }

  // Enregistrer l'événement dans l'audit
  await prisma.paymentAudit.create({
    data: {
      reservationId: metadata.reservationId,
      event: "setup_intent.setup_failed",
      data: {
        setupIntentId: setupIntent.id,
        error: setupIntent.last_setup_error,
      },
    },
  });
}

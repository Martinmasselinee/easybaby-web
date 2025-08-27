import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { stripe } from "@/lib/stripe/stripe-server";

const prisma = new PrismaClient();

// Schéma de validation pour la requête de confirmation
const confirmSchema = z.object({
  paymentIntentId: z.string(),
  setupIntentId: z.string(),
  reservationId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = confirmSchema.parse(body);
    
    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: validatedData.reservationId },
      include: {
        product: true,
        pickupHotel: true,
        dropHotel: true,
        discountCode: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que les IDs Stripe correspondent
    if (
      reservation.stripePaymentIntentId !== validatedData.paymentIntentId ||
      reservation.stripeSetupIntentId !== validatedData.setupIntentId
    ) {
      return NextResponse.json(
        { error: "Identifiants de paiement invalides" },
        { status: 400 }
      );
    }

    // Vérifier l'état du PaymentIntent
    const paymentIntent = await stripe().paymentIntents.retrieve(
      validatedData.paymentIntentId
    );

    if (paymentIntent.status !== "requires_capture") {
      return NextResponse.json(
        { error: "Le paiement n'est pas en attente de capture" },
        { status: 400 }
      );
    }

    // Vérifier l'état du SetupIntent
    const setupIntent = await stripe().setupIntents.retrieve(
      validatedData.setupIntentId
    );

    if (setupIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "La configuration de paiement n'a pas réussi" },
        { status: 400 }
      );
    }

    // Mettre à jour la réservation à CONFIRMED
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.CONFIRMED,
      },
    });

    // Enregistrer l'audit du paiement
    await prisma.paymentAudit.create({
      data: {
        reservationId: reservation.id,
        event: "payment_confirmed",
        data: {
          paymentIntentId: validatedData.paymentIntentId,
          setupIntentId: validatedData.setupIntentId,
          amount: reservation.depositCents,
        },
      },
    });

    // TODO: Envoyer les emails de confirmation
    // - Email à l'utilisateur avec QR code
    // - Email à l'hôtel avec ICS

    return NextResponse.json({
      success: true,
      reservation: {
        id: updatedReservation.id,
        code: updatedReservation.code,
        status: updatedReservation.status,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la confirmation:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}

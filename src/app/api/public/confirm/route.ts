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
    
    // Mettre à jour l'inventaire pour refléter la réservation
    try {
      // Récupérer l'inventaire actuel du produit dans l'hôtel de retrait
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          productId: reservation.productId,
          hotelId: reservation.pickupHotelId,
        },
      });
      
      if (inventoryItem) {
        // Décrémenter la quantité disponible
        // Note: Dans une implémentation réelle, nous devrions vérifier à nouveau la disponibilité
        // et gérer les cas où la quantité disponible est insuffisante
        const newQuantity = Math.max(0, inventoryItem.quantity - 1);
        
        // Mettre à jour l'inventaire
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            active: newQuantity > 0,
          },
        });
      }
    } catch (inventoryError) {
      // Enregistrer l'erreur mais ne pas bloquer la confirmation
      console.error("Erreur lors de la mise à jour de l'inventaire:", inventoryError);
      
      // Enregistrer l'audit de l'erreur
      await prisma.paymentAudit.create({
        data: {
          reservationId: reservation.id,
          event: "inventory_update_error",
          data: {
            error: inventoryError.message || "Erreur inconnue",
          },
        },
      });
    }

    // Envoyer les emails de confirmation
    try {
      // Préparer les données pour l'envoi des emails
      const emailData = {
        reservationCode: reservation.code,
        productName: reservation.product.name,
        pickupHotel: reservation.pickupHotel.name,
        pickupHotelAddress: reservation.pickupHotel.address,
        pickupHotelEmail: reservation.pickupHotel.email,
        pickupDateTime: reservation.startAt.toISOString(),
        dropHotel: reservation.dropHotel.name,
        dropHotelAddress: reservation.dropHotel.address,
        dropDateTime: reservation.endAt.toISOString(),
        totalPrice: `${(reservation.priceCents / 100).toFixed(2)} €`,
        depositAmount: `${(reservation.depositCents / 100).toFixed(2)} €`,
        userEmail: reservation.userEmail,
        userPhone: reservation.userPhone || undefined,
        hotelDiscountCode: reservation.discountCode?.code,
        locale: "fr", // Par défaut en français
      };
      
      // Appel à l'API d'envoi d'emails
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
      
      if (!emailResponse.ok) {
        throw new Error(`Erreur HTTP: ${emailResponse.status}`);
      }
      
      // Enregistrer l'audit de l'envoi des emails
      await prisma.paymentAudit.create({
        data: {
          reservationId: reservation.id,
          event: "emails_sent",
          data: {
            success: true,
          },
        },
      });
    } catch (emailError) {
      // Enregistrer l'erreur mais ne pas bloquer la confirmation
      console.error("Erreur lors de l'envoi des emails:", emailError);
      
      // Enregistrer l'audit de l'erreur
      await prisma.paymentAudit.create({
        data: {
          reservationId: reservation.id,
          event: "emails_error",
          data: {
            error: emailError.message || "Erreur inconnue",
          },
        },
      });
    }

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

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendReservationEmails } from "@/lib/email/send-emails";

// Schéma de validation pour la requête
const resendEmailRequestSchema = z.object({
  reservationId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = resendEmailRequestSchema.parse(body);

    // Récupérer la réservation avec toutes les informations nécessaires
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

    // Envoyer les emails
    const result = await sendReservationEmails(emailData);

    // Enregistrer l'audit de l'envoi des emails
    await prisma.paymentAudit.create({
      data: {
        reservationId: reservation.id,
        event: "emails_resent",
        data: {
          userEmailSuccess: result.userEmail.success,
          hotelEmailSuccess: result.hotelEmail.success,
        },
      },
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Erreur lors du renvoi des emails:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors du renvoi des emails" },
      { status: 500 }
    );
  }
}

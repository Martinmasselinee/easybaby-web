import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendReservationEmails } from "@/lib/email/send-emails";

// Schéma de validation pour la requête
const emailRequestSchema = z.object({
  reservationCode: z.string(),
  productName: z.string(),
  pickupHotel: z.string(),
  pickupHotelAddress: z.string(),
  pickupHotelEmail: z.string().email(),
  pickupDateTime: z.string(),
  dropHotel: z.string(),
  dropHotelAddress: z.string(),
  dropDateTime: z.string(),
  totalPrice: z.string(),
  depositAmount: z.string(),
  userEmail: z.string().email(),
  userPhone: z.string().optional(),
  hotelDiscountCode: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = emailRequestSchema.parse(body);

    // Envoyer les emails
    const result = await sendReservationEmails(validatedData);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'envoi des emails" },
      { status: 500 }
    );
  }
}

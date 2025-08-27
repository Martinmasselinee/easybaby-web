import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour d'une réservation
const updateReservationSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "NO_SHOW",
    "DAMAGED",
    "CANCELLED",
  ]),
});

// GET /api/admin/reservations/[reservationId] - Détails d'une réservation
export async function GET(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const reservationId = params.reservationId;

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        city: true,
        pickupHotel: true,
        dropHotel: true,
        product: true,
        discountCode: true,
        claim: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reservations/[reservationId] - Mettre à jour une réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const reservationId = params.reservationId;

    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = updateReservationSchema.parse(body);

    // Récupérer la réservation existante
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la réservation
    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: validatedData.status as ReservationStatus,
      },
      include: {
        city: true,
        pickupHotel: true,
        dropHotel: true,
        product: true,
        discountCode: true,
      },
    });

    // Enregistrer l'audit du changement de statut
    await prisma.paymentAudit.create({
      data: {
        reservationId,
        event: `status_changed_to_${validatedData.status}`,
        data: {
          previousStatus: existingReservation.status,
          changedBy: session.user.id,
        },
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

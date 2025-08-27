import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour la requête de disponibilité
const availabilitySchema = z.object({
  citySlug: z.string(),
  productId: z.string(),
  pickupHotelId: z.string(),
  dropHotelId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);
    
    // Convertir les dates
    const startAt = new Date(validatedData.startAt);
    const endAt = new Date(validatedData.endAt);
    
    // Vérifier que la date de début est avant la date de fin
    if (startAt >= endAt) {
      return NextResponse.json(
        { error: "La date de début doit être avant la date de fin" },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité
    const availability = await checkAvailability(
      validatedData.pickupHotelId,
      validatedData.productId,
      startAt,
      endAt
    );

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Erreur lors de la vérification de disponibilité:", error);
    
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

// Fonction pour vérifier la disponibilité
async function checkAvailability(
  hotelId: string,
  productId: string,
  startAt: Date,
  endAt: Date
) {
  // Récupérer l'inventaire total pour ce produit dans cet hôtel
  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      hotelId,
      productId,
      active: true,
    },
  });

  if (!inventoryItem) {
    return { available: false, alternatives: [] };
  }

  // Compter les réservations qui se chevauchent
  const overlappingReservations = await prisma.reservation.count({
    where: {
      pickupHotelId: hotelId,
      productId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      AND: [
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } },
      ],
    },
  });

  const available = inventoryItem.quantity > overlappingReservations;

  // Si non disponible, suggérer des alternatives
  let alternatives = [];
  if (!available) {
    // Trouver des créneaux alternatifs
    alternatives = await findAlternativeSlots(hotelId, productId, startAt, endAt, inventoryItem.quantity);
  }

  return { 
    available, 
    alternatives,
    inventory: {
      total: inventoryItem.quantity,
      booked: overlappingReservations,
      available: inventoryItem.quantity - overlappingReservations
    }
  };
}

// Fonction pour trouver des créneaux alternatifs
async function findAlternativeSlots(
  hotelId: string,
  productId: string,
  startAt: Date,
  endAt: Date,
  totalQuantity: number
) {
  const alternatives = [];
  const duration = endAt.getTime() - startAt.getTime();
  
  // Suggérer le jour suivant
  const nextDayStart = new Date(startAt);
  nextDayStart.setDate(nextDayStart.getDate() + 1);
  
  const nextDayEnd = new Date(nextDayStart.getTime() + duration);
  
  // Vérifier si le créneau du jour suivant est disponible
  const nextDayReservations = await prisma.reservation.count({
    where: {
      pickupHotelId: hotelId,
      productId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      AND: [
        { startAt: { lt: nextDayEnd } },
        { endAt: { gt: nextDayStart } },
      ],
    },
  });
  
  if (nextDayReservations < totalQuantity) {
    alternatives.push({
      startAt: nextDayStart.toISOString(),
      endAt: nextDayEnd.toISOString(),
      available: totalQuantity - nextDayReservations,
    });
  }
  
  // Suggérer le jour précédent
  const prevDayStart = new Date(startAt);
  prevDayStart.setDate(prevDayStart.getDate() - 1);
  
  const prevDayEnd = new Date(prevDayStart.getTime() + duration);
  
  // Vérifier si le créneau du jour précédent est disponible
  const prevDayReservations = await prisma.reservation.count({
    where: {
      pickupHotelId: hotelId,
      productId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      AND: [
        { startAt: { lt: prevDayEnd } },
        { endAt: { gt: prevDayStart } },
      ],
    },
  });
  
  if (prevDayReservations < totalQuantity) {
    alternatives.push({
      startAt: prevDayStart.toISOString(),
      endAt: prevDayEnd.toISOString(),
      available: totalQuantity - prevDayReservations,
    });
  }
  
  return alternatives;
}

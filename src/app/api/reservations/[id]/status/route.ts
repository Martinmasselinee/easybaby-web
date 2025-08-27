import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { invalidateReservationsCache, invalidateInventoryCache, invalidateAvailabilityCache } from "@/lib/cache";

// Schéma de validation pour la requête de mise à jour de statut
const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW", "DAMAGED", "CANCELLED"]),
  note: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id;
    
    // Vérifier si la réservation existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    // Mettre à jour le statut de la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: validatedData.status,
      },
    });

    // Enregistrer l'audit du changement de statut
    await prisma.paymentAudit.create({
      data: {
        reservationId,
        event: "status_changed",
        data: {
          oldStatus: reservation.status,
          newStatus: validatedData.status,
          note: validatedData.note,
        },
      },
    });

    // Si le statut est passé à COMPLETED, mettre à jour l'inventaire pour rendre le produit disponible
    if (validatedData.status === "COMPLETED" && reservation.status !== "COMPLETED") {
      try {
        // Récupérer l'inventaire du produit dans l'hôtel de retour
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: reservation.productId,
            hotelId: reservation.dropHotelId,
          },
        });

        if (inventoryItem) {
          // Incrémenter la quantité disponible
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: inventoryItem.quantity + 1,
              active: true,
            },
          });
        }
      } catch (inventoryError) {
        // Enregistrer l'erreur mais ne pas bloquer la mise à jour du statut
        console.error("Erreur lors de la mise à jour de l'inventaire:", inventoryError);
        
        await prisma.paymentAudit.create({
          data: {
            reservationId,
            event: "inventory_update_error",
            data: {
              error: inventoryError.message || "Erreur inconnue",
            },
          },
        });
      }
    }

    // Invalider les caches de réservations et de disponibilité
    invalidateReservationsCache(reservationId, reservation.pickupHotelId, reservation.productId);
    invalidateInventoryCache(reservation.pickupHotelId, reservation.productId);
    invalidateAvailabilityCache(reservation.pickupHotelId, reservation.productId);
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: updatedReservation.id,
        status: updatedReservation.status,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}

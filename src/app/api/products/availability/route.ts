import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const cityId = searchParams.get("cityId");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");

    if (!productId) {
      return NextResponse.json(
        { error: "productId est requis" },
        { status: 400 }
      );
    }

    if (!dateStart || !dateEnd) {
      return NextResponse.json(
        { error: "dateStart et dateEnd sont requis" },
        { status: 400 }
      );
    }

    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "La date de début doit être avant la date de fin" },
        { status: 400 }
      );
    }

    // Construire la requête pour trouver les hôtels avec ce produit
    const hotelQuery = {
      where: {
        inventory: {
          some: {
            productId,
            active: true,
            quantity: { gt: 0 },
          },
        },
      },
    };

    // Si un cityId est fourni, filtrer par cette ville
    if (cityId) {
      hotelQuery.where = {
        ...hotelQuery.where,
        cityId,
      };
    }

    // Récupérer les hôtels qui ont ce produit
    const hotels = await prisma.hotel.findMany(hotelQuery);

    // Pour chaque hôtel, vérifier la disponibilité du produit aux dates spécifiées
    const availability = await Promise.all(
      hotels.map(async (hotel) => {
        // Récupérer l'inventaire de ce produit dans cet hôtel
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            hotelId: hotel.id,
            productId,
            active: true,
          },
        });

        if (!inventoryItem) {
          return null;
        }

        // Compter les réservations qui se chevauchent
        const overlappingReservations = await prisma.reservation.count({
          where: {
            pickupHotelId: hotel.id,
            productId,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            AND: [
              { startAt: { lt: endDate } },
              { endAt: { gt: startDate } },
            ],
          },
        });

        // Calculer la quantité disponible
        const availableQuantity = Math.max(0, inventoryItem.quantity - overlappingReservations);

        return {
          hotelId: hotel.id,
          hotelName: hotel.name,
          totalQuantity: inventoryItem.quantity,
          availableQuantity,
          isAvailable: availableQuantity > 0,
        };
      })
    );

    // Filtrer les résultats nuls et trier par disponibilité
    const filteredAvailability = availability
      .filter(Boolean)
      .sort((a, b) => (b?.availableQuantity || 0) - (a?.availableQuantity || 0));

    // Déterminer si le produit est disponible dans au moins un hôtel
    const isAvailable = filteredAvailability.some((item) => item?.isAvailable);

    // Si le produit n'est pas disponible, suggérer des dates alternatives
    let alternatives = [];
    if (!isAvailable) {
      // Pour la V1, suggérer simplement le jour suivant
      const nextDayStart = new Date(startDate);
      nextDayStart.setDate(nextDayStart.getDate() + 1);
      
      const nextDayEnd = new Date(endDate);
      nextDayEnd.setDate(nextDayEnd.getDate() + 1);
      
      alternatives = [
        {
          startAt: nextDayStart.toISOString(),
          endAt: nextDayEnd.toISOString(),
        },
      ];
    }

    return NextResponse.json({
      productId,
      isAvailable,
      hotels: filteredAvailability,
      alternatives,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la disponibilité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de la disponibilité" },
      { status: 500 }
    );
  }
}

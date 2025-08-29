import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get("citySlug");
    const productId = searchParams.get("productId");
    const hotelId = searchParams.get("hotelId");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");

    if (!citySlug) {
      return NextResponse.json(
        { error: "citySlug est requis" },
        { status: 400 }
      );
    }

    // Construire la requête de base pour les hôtels
    const hotelsQuery = {
      where: {
        city: {
          slug: citySlug,
        },
        ...(hotelId && { id: hotelId }),
      },
      include: {
        inventory: {
          where: {},
          include: {
            product: true,
          },
        },
      },
    };

    // Si un productId est fourni, filtrer par ce produit
    if (productId) {
      hotelsQuery.include.inventory.where = {
        ...hotelsQuery.include.inventory.where,
        productId,
        active: true,
        quantity: { gt: 0 },
      };
    }

    // Récupérer les hôtels avec leur inventaire
    const hotels = await prisma.hotel.findMany(hotelsQuery);

    // Transformer les résultats pour inclure les informations de disponibilité
    const hotelsWithAvailability = await Promise.all(
      hotels.map(async (hotel) => {
        // Pour chaque produit dans l'inventaire de l'hôtel, calculer la disponibilité
        const inventoryWithAvailability = await Promise.all(
          hotel.inventory.map(async (item) => {
            let availableQuantity = item.quantity;

            // Si des dates sont fournies, vérifier les réservations qui se chevauchent
            if (dateStart && dateEnd) {
              const startDate = new Date(dateStart);
              const endDate = new Date(dateEnd);

              // Compter les réservations qui se chevauchent
              const overlappingReservations = await prisma.reservation.count({
                where: {
                  pickupHotelId: hotel.id,
                  productId: item.productId,
                  status: {
                    in: ["PENDING", "CONFIRMED"],
                  },
                  AND: [
                    { startAt: { lt: endDate } },
                    { endAt: { gt: startDate } },
                  ],
                },
              });

              // Soustraire le nombre de réservations qui se chevauchent
              availableQuantity = Math.max(0, item.quantity - overlappingReservations);
            }

            return {
              ...item,
              availableQuantity,
            };
          })
        );

        // Déterminer si l'hôtel a au moins un produit disponible
        const hasAvailableProducts = inventoryWithAvailability.some(
          (item) => item.availableQuantity > 0
        );

        return {
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          hasAvailableProducts,
          inventory: inventoryWithAvailability.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            totalQuantity: item.quantity,
            availableQuantity: item.availableQuantity,
          })),
        };
      })
    );

    return NextResponse.json(hotelsWithAvailability);
  } catch (error) {
    console.error("Erreur lors de la récupération des hôtels avec disponibilité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer toutes les villes
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            hotels: true,
          },
        },
      },
    });

    // Pour chaque ville, compter les produits disponibles dans les inventaires des hôtels
    const citiesWithCounts = await Promise.all(
      cities.map(async (city) => {
        // Récupérer les IDs des hôtels dans cette ville
        const hotelIds = await prisma.hotel.findMany({
          where: { cityId: city.id },
          select: { id: true },
        });

        const hotelIdsArray = hotelIds.map((hotel) => hotel.id);

        // Compter les produits uniques disponibles dans les inventaires de ces hôtels
        const productsCount = await prisma.inventoryItem.count({
          where: {
            hotelId: { in: hotelIdsArray },
            active: true,
            quantity: { gt: 0 },
          },
          distinct: ["productId"],
        });

        return {
          id: city.id,
          name: city.name,
          slug: city.slug,
          hotelsCount: city._count.hotels,
          productsCount,
        };
      })
    );

    return NextResponse.json(citiesWithCounts);
  } catch (error) {
    console.error("Erreur lors de la récupération des villes avec compteurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}

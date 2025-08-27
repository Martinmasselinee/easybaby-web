import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const citySlug = params.citySlug;

    // Récupérer la ville par son slug
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) {
      return NextResponse.json(
        { error: "Ville non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les IDs des hôtels dans cette ville
    const hotels = await prisma.hotel.findMany({
      where: { cityId: city.id },
      select: { id: true },
    });

    const hotelIds = hotels.map((hotel) => hotel.id);

    // Récupérer tous les produits disponibles dans les inventaires des hôtels de cette ville
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        hotelId: { in: hotelIds },
        active: true,
        quantity: { gt: 0 },
      },
      include: {
        product: true,
      },
      distinct: ["productId"],
    });

    // Transformer les résultats pour obtenir les produits avec leur disponibilité
    const productsWithAvailability = await Promise.all(
      inventoryItems.map(async (item) => {
        // Calculer la disponibilité totale pour ce produit dans tous les hôtels de la ville
        const totalAvailability = await prisma.inventoryItem.aggregate({
          where: {
            productId: item.productId,
            hotelId: { in: hotelIds },
            active: true,
          },
          _sum: {
            quantity: true,
          },
        });

        // Compter le nombre d'hôtels qui ont ce produit disponible
        const hotelsWithProduct = await prisma.inventoryItem.count({
          where: {
            productId: item.productId,
            hotelId: { in: hotelIds },
            active: true,
            quantity: { gt: 0 },
          },
        });

        return {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description || "",
          pricePerHour: item.product.pricePerHour,
          pricePerDay: item.product.pricePerDay,
          deposit: item.product.deposit,
          availability: {
            total: totalAvailability._sum.quantity || 0,
            available: totalAvailability._sum.quantity || 0, // Pour la V1, on considère que tout est disponible
            hotelsCount: hotelsWithProduct,
          },
        };
      })
    );

    return NextResponse.json(productsWithAvailability);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour de l'inventaire
const updateInventorySchema = z.object({
  productId: z.string().min(1, "L'ID du produit est requis"),
  quantity: z.number().int().min(0, "La quantité doit être positive"),
  active: z.boolean().optional(),
});

// GET /api/admin/hotels/[hotelId]/inventory - Liste de l'inventaire d'un hôtel
export async function GET(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
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

    const hotelId = params.hotelId;

    // Vérifier si l'hôtel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hôtel non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'inventaire
    const inventory = await prisma.inventoryItem.findMany({
      where: { hotelId },
      include: {
        product: true,
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    // Pour chaque élément d'inventaire, calculer les réservations actives
    const inventoryWithAvailability = await Promise.all(
      inventory.map(async (item) => {
        const activeReservations = await prisma.reservation.count({
          where: {
            pickupHotelId: hotelId,
            productId: item.productId,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            endAt: {
              gt: new Date(),
            },
          },
        });

        return {
          ...item,
          inUse: activeReservations,
          available: item.quantity - activeReservations,
        };
      })
    );

    return NextResponse.json(inventoryWithAvailability);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'inventaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'inventaire" },
      { status: 500 }
    );
  }
}

// POST /api/admin/hotels/[hotelId]/inventory - Ajouter ou mettre à jour un élément d'inventaire
export async function POST(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
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

    const hotelId = params.hotelId;

    // Vérifier si l'hôtel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hôtel non trouvé" },
        { status: 404 }
      );
    }

    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si un élément d'inventaire existe déjà pour ce produit et cet hôtel
    const existingInventory = await prisma.inventoryItem.findFirst({
      where: {
        hotelId,
        productId: validatedData.productId,
      },
    });

    let inventoryItem;

    if (existingInventory) {
      // Mettre à jour l'élément existant
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: existingInventory.id },
        data: {
          quantity: validatedData.quantity,
          active: validatedData.active ?? true,
        },
        include: {
          product: true,
        },
      });
    } else {
      // Créer un nouvel élément
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          hotelId,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          active: validatedData.active ?? true,
        },
        include: {
          product: true,
        },
      });
    }

    // Calculer les réservations actives
    const activeReservations = await prisma.reservation.count({
      where: {
        pickupHotelId: hotelId,
        productId: validatedData.productId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        endAt: {
          gt: new Date(),
        },
      },
    });

    return NextResponse.json({
      ...inventoryItem,
      inUse: activeReservations,
      available: inventoryItem.quantity - activeReservations,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inventaire:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'inventaire" },
      { status: 500 }
    );
  }
}

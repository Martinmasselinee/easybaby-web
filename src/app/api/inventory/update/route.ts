import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { invalidateInventoryCache, invalidateAvailabilityCache } from "@/lib/cache";

// Schéma de validation pour la requête de mise à jour d'inventaire
const inventoryUpdateSchema = z.object({
  productId: z.string(),
  hotelId: z.string(),
  quantity: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
  try {
    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = inventoryUpdateSchema.parse(body);

    // Vérifier si l'élément d'inventaire existe déjà
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        productId: validatedData.productId,
        hotelId: validatedData.hotelId,
      },
    });

    // Mettre à jour ou créer l'élément d'inventaire
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: {
        id: existingItem?.id || "",
      },
      update: {
        quantity: validatedData.quantity,
        active: validatedData.quantity > 0,
      },
      create: {
        productId: validatedData.productId,
        hotelId: validatedData.hotelId,
        quantity: validatedData.quantity,
        active: validatedData.quantity > 0,
      },
    });

    // Invalider les caches d'inventaire et de disponibilité
    invalidateInventoryCache(validatedData.hotelId, validatedData.productId);
    invalidateAvailabilityCache(validatedData.hotelId, validatedData.productId);
    
    return NextResponse.json(inventoryItem);
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

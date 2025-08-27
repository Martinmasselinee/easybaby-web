import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour d'un hôtel
const updateHotelSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  address: z.string().min(1, "L'adresse est requise").optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  cityId: z.string().min(1, "La ville est requise").optional(),
  contactName: z.string().optional(),
  discountCode: z.string().optional(),
});

// GET /api/admin/hotels/[hotelId] - Détails d'un hôtel
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

    // Récupérer l'hôtel
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        city: true,
        discountCode: true,
        inventory: {
          include: {
            product: true,
          },
        },
        revenueAgreements: {
          orderBy: {
            startsAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hôtel non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'hôtel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'hôtel" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/hotels/[hotelId] - Mettre à jour un hôtel
export async function PATCH(
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

    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = updateHotelSchema.parse(body);
    
    // Extraire le code de réduction s'il est fourni
    const { discountCode, ...hotelData } = validatedData;

    // Récupérer l'hôtel existant
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        discountCode: true,
      },
    });

    if (!existingHotel) {
      return NextResponse.json(
        { error: "Hôtel non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour l'hôtel
    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...hotelData,
      },
      include: {
        city: true,
        discountCode: true,
      },
    });

    // Gérer le code de réduction
    if (discountCode) {
      if (existingHotel.discountCode) {
        // Mettre à jour le code existant
        await prisma.discountCode.update({
          where: { id: existingHotel.discountCode.id },
          data: {
            code: discountCode,
            active: true,
          },
        });
      } else {
        // Créer un nouveau code
        await prisma.discountCode.create({
          data: {
            code: discountCode,
            hotelId,
            kind: "HOTEL_70",
            active: true,
          },
        });
      }
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'hôtel:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'hôtel" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hotels/[hotelId] - Supprimer un hôtel
export async function DELETE(
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

    // Vérifier si l'hôtel a des réservations
    const reservationsCount = await prisma.reservation.count({
      where: {
        OR: [
          { pickupHotelId: hotelId },
          { dropHotelId: hotelId },
        ],
      },
    });

    if (reservationsCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un hôtel avec des réservations" },
        { status: 400 }
      );
    }

    // Supprimer l'inventaire associé
    await prisma.inventoryItem.deleteMany({
      where: { hotelId },
    });

    // Supprimer les accords de revenus associés
    await prisma.revenueAgreement.deleteMany({
      where: { hotelId },
    });

    // Supprimer le code de réduction associé
    await prisma.discountCode.deleteMany({
      where: { hotelId },
    });

    // Supprimer l'hôtel
    await prisma.hotel.delete({
      where: { id: hotelId },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'hôtel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'hôtel" },
      { status: 500 }
    );
  }
}

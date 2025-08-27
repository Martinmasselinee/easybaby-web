import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Schéma de validation pour la création d'un hôtel
const createHotelSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide"),
  cityId: z.string().min(1, "La ville est requise"),
  contactName: z.string().optional(),
  discountCode: z.string().optional(),
});

// GET /api/admin/hotels - Liste des hôtels
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const cityId = searchParams.get("cityId");
    
    // Construire la requête
    const where: unknown = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (cityId) {
      where.cityId = cityId;
    }

    // Récupérer les hôtels
    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        city: true,
        discountCode: true,
        inventory: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Erreur lors de la récupération des hôtels:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des hôtels" },
      { status: 500 }
    );
  }
}

// POST /api/admin/hotels - Créer un hôtel
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Extraire et valider les données de la requête
    const body = await request.json();
    const validatedData = createHotelSchema.parse(body);
    
    // Extraire le code de réduction s'il est fourni
    const { discountCode, ...hotelData } = validatedData;
    
    // Créer l'hôtel
    const hotel = await prisma.hotel.create({
      data: {
        ...hotelData,
        // Si un code de réduction est fourni, le créer
        ...(discountCode
          ? {
              discountCode: {
                create: {
                  code: discountCode,
                  kind: "HOTEL_70",
                  active: true,
                },
              },
            }
          : {}),
        // Créer un accord de revenus par défaut
        revenueAgreements: {
          create: {
            defaultShare: "PLATFORM_70",
            startsAt: new Date(),
          },
        },
      },
      include: {
        city: true,
        discountCode: true,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'hôtel:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la création de l'hôtel" },
      { status: 500 }
    );
  }
}

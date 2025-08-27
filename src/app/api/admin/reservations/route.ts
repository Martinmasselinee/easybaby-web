import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/admin/reservations - Liste des réservations
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
    const status = searchParams.get("status");
    const hotelId = searchParams.get("hotelId");
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Construire la requête
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { userEmail: { contains: search, mode: "insensitive" } },
        { userPhone: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (status) {
      where.status = status as ReservationStatus;
    }
    
    if (hotelId) {
      where.OR = [
        { pickupHotelId: hotelId },
        { dropHotelId: hotelId },
      ];
    }
    
    if (productId) {
      where.productId = productId;
    }

    // Compter le nombre total de réservations
    const total = await prisma.reservation.count({ where });
    
    // Récupérer les réservations paginées
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        city: true,
        pickupHotel: true,
        dropHotel: true,
        product: true,
        discountCode: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: reservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}

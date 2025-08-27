import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus, ShareType } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/cron/settle-revenue - Calcule et enregistre les revenus
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    const isAuthorized = token === process.env.CRON_SECRET;
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer la date de début (hier)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);
    
    // Récupérer la date de fin (aujourd'hui)
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    // Récupérer les réservations terminées dans la période
    const completedReservations = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.COMPLETED,
        updatedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        pickupHotel: true,
        product: true,
      },
    });

    // Calculer les revenus pour chaque réservation
    const revenueUpdates = completedReservations.map((reservation) => {
      // Pour V1, le prix est de 0€ (pilote gratuit), mais on calcule quand même les parts
      const totalRevenue = reservation.priceCents;
      
      // Déterminer les parts selon le type de partage
      let platformShare = 0;
      let hotelShare = 0;
      
      if (reservation.revenueShareApplied === ShareType.PLATFORM_70) {
        // 70% pour la plateforme, 30% pour l'hôtel
        platformShare = Math.round(totalRevenue * 0.7);
        hotelShare = totalRevenue - platformShare;
      } else {
        // 30% pour la plateforme, 70% pour l'hôtel
        hotelShare = Math.round(totalRevenue * 0.7);
        platformShare = totalRevenue - hotelShare;
      }
      
      // Mettre à jour la réservation avec les revenus calculés
      return prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          revenueComputedCents: totalRevenue,
        },
      });
    });

    // Exécuter toutes les mises à jour
    await Promise.all(revenueUpdates);

    return NextResponse.json({
      success: true,
      processedCount: completedReservations.length,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      message: `${completedReservations.length} réservations ont été traitées pour le règlement des revenus`,
    });
  } catch (error) {
    console.error("Erreur lors du règlement des revenus:", error);
    return NextResponse.json(
      { error: "Erreur lors du règlement des revenus" },
      { status: 500 }
    );
  }
}

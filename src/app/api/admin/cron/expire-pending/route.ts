import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus } from "@prisma/client";
import { env } from "../../../../../../env.mjs";

const prisma = new PrismaClient();

// GET /api/admin/cron/expire-pending - Expire les réservations en attente
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

    // Récupérer le TTL des réservations en attente depuis les variables d'environnement
    const ttlMinutes = env.RESERVATION_PENDING_TTL_MIN;
    
    // Calculer la date limite pour les réservations en attente
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - ttlMinutes);

    // Récupérer les réservations en attente expirées
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        createdAt: {
          lt: expirationDate,
        },
      },
    });

    // Mettre à jour les réservations expirées
    const updatePromises = expiredReservations.map((reservation) =>
      prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.CANCELLED,
        },
      })
    );

    // Enregistrer les audits
    const auditPromises = expiredReservations.map((reservation) =>
      prisma.paymentAudit.create({
        data: {
          reservationId: reservation.id,
          event: "reservation_expired",
          data: {
            expirationDate: expirationDate.toISOString(),
            ttlMinutes,
          },
        },
      })
    );

    // Exécuter toutes les mises à jour
    await Promise.all([...updatePromises, ...auditPromises]);

    return NextResponse.json({
      success: true,
      expiredCount: expiredReservations.length,
      message: `${expiredReservations.length} réservations en attente ont été expirées`,
    });
  } catch (error) {
    console.error("Erreur lors de l'expiration des réservations en attente:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'expiration des réservations en attente" },
      { status: 500 }
    );
  }
}

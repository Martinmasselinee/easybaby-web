import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReservationStatus, ShareType } from "@prisma/client";
import { z } from "zod";
import { createPaymentIntent, createSetupIntent } from "@/lib/stripe/stripe-server";
import { getDiscountCodeByCode } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-middleware";

const prisma = new PrismaClient();

// Schéma de validation pour la requête de paiement
const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  citySlug: z.string().optional(),
  pickupHotelId: z.string(),
  dropHotelId: z.string(),
  productId: z.string(),
  pickupDate: z.string().datetime(),
  dropDate: z.string().datetime(),
  discountCode: z.string().optional(),
  rentalPrice: z.number().optional(),
  depositAmount: z.number().optional(),
});

async function handlePost(request: NextRequest) {
  // Extraire et valider les données de la requête
  const body = await request.json();
  const validatedData = checkoutSchema.parse(body);
  
  // Convertir les dates
  const startAt = new Date(validatedData.pickupDate);
  const endAt = new Date(validatedData.dropDate);
  
  // Vérifier que la date de début est avant la date de fin
  if (startAt >= endAt) {
    return NextResponse.json(
      { error: "La date de début doit être avant la date de fin" },
      { status: 400 }
    );
  }

    // Récupérer le produit pour obtenir le montant du dépôt
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier la disponibilité pour l'hôtel de retrait
    const pickupAvailability = await checkAvailability(
      validatedData.pickupHotelId,
      validatedData.productId,
      startAt,
      endAt
    );

    if (!pickupAvailability.available) {
      return NextResponse.json(
        { error: "Produit non disponible pour les dates sélectionnées à l'hôtel de retrait", alternatives: pickupAvailability.alternatives },
        { status: 409 }
      );
    }

    // Vérifier la disponibilité pour l'hôtel de retour (si différent)
    if (validatedData.pickupHotelId !== validatedData.dropHotelId) {
      const dropoffAvailability = await checkAvailability(
        validatedData.dropHotelId,
        validatedData.productId,
        startAt,
        endAt
      );

      if (!dropoffAvailability.available) {
        return NextResponse.json(
          { error: "Produit non disponible pour les dates sélectionnées à l'hôtel de retour", alternatives: dropoffAvailability.alternatives },
          { status: 409 }
        );
      }
    }

    // Générer un code unique pour la réservation
    const reservationCode = generateReservationCode();
    
    // Calculer la durée en heures et en jours
    const durationMs = endAt.getTime() - startAt.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationHours / 24);
    
    // Déterminer le type de tarification (horaire ou journalière)
    const pricingType = durationHours <= 24 ? "HOURLY" : "DAILY";
    
    // Calculer le prix et vérifier le code de réduction
    let finalPriceCents = validatedData.rentalPrice || (pricingType === "HOURLY" ? 
      product.pricePerHour * durationHours : 
      product.pricePerDay * durationDays);
    
    let revenueShareType = ShareType.PLATFORM_70; // Par défaut, 70% pour la plateforme
    let discountCodeId = null;
    
    // Si un code de réduction est fourni, on le vérifie et on l'applique
    if (validatedData.discountCode) {
      const discountCode = await getDiscountCodeByCode(validatedData.discountCode);
      
      if (discountCode && discountCode.active) {
        discountCodeId = discountCode.id;
        revenueShareType = discountCode.kind; // Utiliser le type de partage défini dans le code
        
        // Pour la V1, on applique une réduction de 10% (à titre d'exemple)
        // Dans une vraie implémentation, le prix final serait déjà calculé côté client
        if (!validatedData.rentalPrice) {
          finalPriceCents = Math.round(finalPriceCents * 0.9);
        }
      }
    }

    // Créer une réservation en attente
    const reservation = await prisma.reservation.create({
      data: {
        code: reservationCode,
        userEmail: validatedData.email,
        userPhone: validatedData.phone || "",
        cityId: validatedData.citySlug ? await getCityIdBySlug(validatedData.citySlug) : "cmewtaexq0000l704q4sxvyit",
        pickupHotelId: validatedData.pickupHotelId,
        dropHotelId: validatedData.dropHotelId,
        productId: validatedData.productId,
        startAt,
        endAt,
        status: ReservationStatus.PENDING,
        priceCents: finalPriceCents,
        depositCents: validatedData.depositAmount || product.deposit,
        durationHours,
        durationDays,
        pricingType,
        revenueShareApplied: revenueShareType,
        ...(discountCodeId
          ? {
              discountCode: {
                connect: {
                  id: discountCodeId,
                },
              },
            }
          : {}),
      },
    });

    // Créer un PaymentIntent pour la pré-autorisation
    const { paymentIntent, success: paymentSuccess } = await createPaymentIntent(
      validatedData.depositAmount || product.deposit,
      {
        reservationId: reservation.id,
        reservationCode,
        userEmail: validatedData.email,
      }
    );

    if (!paymentSuccess || !paymentIntent) {
      // Annuler la réservation en cas d'échec
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CANCELLED },
      });

      return NextResponse.json(
        { error: "Échec de la création du paiement" },
        { status: 500 }
      );
    }

    // Créer un SetupIntent pour sauvegarder la méthode de paiement
    const { setupIntent, success: setupSuccess } = await createSetupIntent({
      reservationId: reservation.id,
      reservationCode,
              userEmail: validatedData.email,
    });

    if (!setupSuccess || !setupIntent) {
      // Annuler la réservation en cas d'échec
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CANCELLED },
      });

      return NextResponse.json(
        { error: "Échec de la création du SetupIntent" },
        { status: 500 }
      );
    }

    // Mettre à jour la réservation avec les IDs Stripe
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeSetupIntentId: setupIntent.id,
      },
    });

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      reservationCode,
      clientSecret: paymentIntent.client_secret,
      setupIntentSecret: setupIntent.client_secret,
    });
}

export const POST = withErrorHandling(handlePost);

// Helper function to get city ID by slug
async function getCityIdBySlug(citySlug: string) {
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: { id: true }
  });
  return city?.id || null;
}

// Fonction pour vérifier la disponibilité
async function checkAvailability(
  hotelId: string,
  productId: string,
  startAt: Date,
  endAt: Date
) {
  console.log(`🔍 Checking availability for hotel ${hotelId}, product ${productId}`);
  console.log(`📅 Period: ${startAt.toISOString()} to ${endAt.toISOString()}`);
  // Récupérer TOUS les inventaires pour ce produit dans cet hôtel
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      hotelId,
      productId,
      active: true,
    },
  });

  if (inventoryItems.length === 0) {
    return { available: false, alternatives: [] };
  }

  // Calculer le total de l'inventaire disponible
  const totalInventory = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

  // Récupérer toutes les réservations qui se chevauchent avec les détails
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      pickupHotelId: hotelId,
      productId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      AND: [
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } },
      ],
    },
    select: {
      startAt: true,
      endAt: true,
      status: true,
    },
  });

  // Calculer le nombre total de produits réservés pendant cette période
  // Chaque réservation consomme 1 produit
  const totalReserved = overlappingReservations.length;
  
  // Vérifier si il y a assez de produits disponibles
  const available = totalInventory > totalReserved;

  console.log(`Availability check for hotel ${hotelId}, product ${productId}:`);
  console.log(`- Total inventory: ${totalInventory}`);
  console.log(`- Overlapping reservations: ${totalReserved}`);
  console.log(`- Available: ${available}`);
  console.log(`- Requested period: ${startAt.toISOString()} to ${endAt.toISOString()}`);
  overlappingReservations.forEach((res, i) => {
    console.log(`- Reservation ${i + 1}: ${res.startAt.toISOString()} to ${res.endAt.toISOString()} (${res.status})`);
  });

  // Si non disponible, suggérer des alternatives
  let alternatives = [];
  if (!available) {
    // Trouver des créneaux alternatifs en cherchant des périodes libres
    const nextDayStart = new Date(startAt);
    nextDayStart.setDate(nextDayStart.getDate() + 1);
    
    const nextDayEnd = new Date(endAt);
    nextDayEnd.setDate(nextDayEnd.getDate() + 1);
    
    alternatives = [
      {
        startAt: nextDayStart.toISOString(),
        endAt: nextDayEnd.toISOString(),
      },
    ];
  }

  return { available, alternatives };
}

// Fonction pour générer un code de réservation unique
function generateReservationCode() {
  // Format: EZB-XXXX où X est un caractère alphanumérique
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclus I, O, 0, 1 pour éviter la confusion
  let code = 'EZB-';
  
  // Générer 4 caractères aléatoires
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

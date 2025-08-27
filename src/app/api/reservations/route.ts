import { NextRequest, NextResponse } from 'next/server';
import { getAllReservations, createReservation } from '@/lib/db';
import { randomBytes } from 'crypto';

// Fonction pour générer un code de réservation alphanumérique
function generateReservationCode() {
  // Format: EZB suivi de 4 caractères alphanumériques
  const randomPart = randomBytes(2).toString('hex').toUpperCase().substring(0, 4);
  return `EZB${randomPart}`;
}

export async function GET() {
  try {
    const reservations = await getAllReservations();
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    const requiredFields = [
      'userEmail', 'cityId', 'pickupHotelId', 'dropHotelId', 'productId',
      'startAt', 'endAt', 'durationHours', 'durationDays', 'pricingType',
      'priceCents', 'depositCents'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Générer un code de réservation unique
    const code = generateReservationCode();
    
    // Créer la réservation
    const reservation = await createReservation({
      code,
      userEmail: body.userEmail,
      userPhone: body.userPhone,
      cityId: body.cityId,
      pickupHotelId: body.pickupHotelId,
      dropHotelId: body.dropHotelId,
      productId: body.productId,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      status: body.status || 'PENDING',
      durationHours: body.durationHours,
      durationDays: body.durationDays,
      pricingType: body.pricingType,
      priceCents: body.priceCents,
      depositCents: body.depositCents,
      stripePaymentIntentId: body.stripePaymentIntentId,
      stripeSetupIntentId: body.stripeSetupIntentId,
      discountCodeId: body.discountCodeId,
      revenueShareApplied: body.revenueShareApplied || 'PLATFORM_70',
    });
    
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    // Gérer les erreurs de clé étrangère
    if ((error as unknown).code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid foreign key reference' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

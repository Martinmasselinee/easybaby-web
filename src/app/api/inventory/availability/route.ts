import { NextRequest, NextResponse } from 'next/server';
import { checkProductAvailability } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const hotelId = searchParams.get('hotelId');
    const startAt = searchParams.get('startAt');
    const endAt = searchParams.get('endAt');
    
    // Validation basique
    if (!productId || !hotelId || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'ProductId, hotelId, startAt, and endAt are required' },
        { status: 400 }
      );
    }
    
    // Convertir les dates
    let startDate: Date;
    let endDate: Date;
    
    try {
      startDate = new Date(startAt);
      endDate = new Date(endAt);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // Vérifier que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // Vérifier que la date de début est avant la date de fin
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }
    
    // Vérifier la disponibilité
    const availability = await checkProductAvailability(
      productId,
      hotelId,
      startDate,
      endDate
    );
    
    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error checking product availability:', error);
    return NextResponse.json(
      { error: 'Failed to check product availability' },
      { status: 500 }
    );
  }
}

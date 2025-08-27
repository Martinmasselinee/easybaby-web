import { NextRequest, NextResponse } from 'next/server';
import { getReservationByCode } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const reservation = await getReservationByCode(code);
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation by code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

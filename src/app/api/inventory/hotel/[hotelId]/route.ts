import { NextRequest, NextResponse } from 'next/server';
import { getInventoryByHotelId, getHotelById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const hotelId = params.hotelId;
    
    // Vérifier si l'hôtel existe
    const hotel = await getHotelById(hotelId);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Récupérer l'inventaire de l'hôtel
    const inventory = await getInventoryByHotelId(hotelId);
    
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching hotel inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

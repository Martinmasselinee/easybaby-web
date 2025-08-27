import { NextRequest, NextResponse } from 'next/server';
import { getHotelsByCityId, getCityBySlug } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const cityId = params.cityId;
    
    // Vérifier si c'est un slug ou un ID
    let city;
    let hotels;
    
    // Si c'est un slug (pas de tirets), essayer de récupérer la ville d'abord
    if (!cityId.includes('-')) {
      city = await getCityBySlug(cityId);
      if (city) {
        hotels = await getHotelsByCityId(city.id);
      }
    } else {
      // Sinon, considérer comme un ID direct
      hotels = await getHotelsByCityId(cityId);
    }
    
    if (!hotels) {
      return NextResponse.json(
        { error: 'City not found or has no hotels' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels by city:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

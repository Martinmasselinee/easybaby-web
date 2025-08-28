import { NextRequest, NextResponse } from 'next/server';
import { getAllHotels, createHotel } from '@/lib/db';
import { withErrorHandling } from '@/lib/api-middleware';

async function handleGet() {
  const hotels = await getAllHotels();
  return NextResponse.json(hotels);
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const body = await request.json();
  
  // Validation basique
  if (!body.name || !body.address || !body.email || !body.cityId) {
    return NextResponse.json(
      { error: 'Name, address, email, and cityId are required' },
      { status: 400 }
    );
  }
  
  // Créer l'hôtel
  const hotel = await createHotel({
    name: body.name,
    address: body.address,
    email: body.email,
    phone: body.phone,
    contactName: body.contactName,
    cityId: body.cityId,
  });
  
  return NextResponse.json(hotel, { status: 201 });
}

export const POST = withErrorHandling(handlePost);

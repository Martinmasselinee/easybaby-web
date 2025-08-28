import { NextRequest, NextResponse } from 'next/server';
import { getAllHotels, createHotel } from '@/lib/db';

export async function GET() {
  try {
    const hotels = await getAllHotels();
    return NextResponse.json(hotels);
  } catch (error: any) {
    console.error('Erreur GET /api/hotels:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des hôtels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error: any) {
    console.error('Erreur POST /api/hotels:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'hôtel' }, { status: 500 });
  }
}

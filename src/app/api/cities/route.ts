import { NextRequest, NextResponse } from 'next/server';
import { getAllCities, createCity } from '@/lib/db';

export async function GET() {
  try {
    const cities = await getAllCities();
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    // Créer la ville
    const city = await createCity({
      name: body.name,
      slug: body.slug,
    });
    
    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    
    // Gérer l'erreur de clé unique (slug déjà utilisé)
    if ((error as unknown).code === 'P2002') {
      return NextResponse.json(
        { error: 'A city with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}

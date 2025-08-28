import { NextRequest, NextResponse } from 'next/server';
import { getAllCities, createCity } from '@/lib/db';
import { z } from 'zod';

const citySchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  slug: z.string().min(1, 'Le slug est obligatoire').regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
});

export async function GET() {
  try {
    const cities = await getAllCities();
    return NextResponse.json(cities);
  } catch (error: any) {
    console.error('Erreur GET /api/cities:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des villes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation avec Zod
    const validatedData = citySchema.parse(body);
    
    // Créer la ville
    const city = await createCity(validatedData);
    
    return NextResponse.json(city, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/cities:', error);
    
    // Gérer l'erreur de clé unique (slug déjà utilisé)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une ville avec ce slug existe déjà' }, { status: 409 });
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Erreur lors de la création de la ville' }, { status: 500 });
  }
}

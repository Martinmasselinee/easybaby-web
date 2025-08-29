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
    return NextResponse.json(cities || []);
  } catch (error: any) {
    console.error('Erreur GET /api/cities:', error);
    // Retourner un array vide au lieu d'une erreur 500
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/cities - Début');
    
    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    // Validation avec Zod
    const validatedData = citySchema.parse(body);
    console.log('✅ Validation réussie:', validatedData);
    
    // Créer la ville
    console.log('🏗️ Création ville en cours...');
    const city = await createCity(validatedData);
    console.log('🎉 Ville créée avec succès:', city);
    
    return NextResponse.json(city, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur POST /api/cities:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    
    // Gérer l'erreur de clé unique (slug déjà utilisé)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une ville avec ce slug existe déjà' }, { status: 409 });
    }
    
    if (error.name === 'ZodError') {
      console.log('🔍 Détails validation Zod:', error.errors);
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création de la ville',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

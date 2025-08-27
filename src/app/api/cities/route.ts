import { NextRequest, NextResponse } from 'next/server';
import { getAllCities, createCity } from '@/lib/db';
import { invalidateCitiesCache } from '@/lib/cache';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-middleware';
import { createError, errorCodes } from '@/lib/error-handler';
import { z } from 'zod';

const citySchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  slug: z.string().min(1, 'Le slug est obligatoire').regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
});

export const GET = withErrorHandling(async () => {
  const cities = await getAllCities();
  return createSuccessResponse(cities);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validation avec Zod
  const validatedData = citySchema.parse(body);
  
  try {
    // Créer la ville
    const city = await createCity(validatedData);
    
    // Invalider le cache des villes
    invalidateCitiesCache();
    
    return NextResponse.json(createSuccessResponse(city), { status: 201 });
  } catch (error: any) {
    // Gérer l'erreur de clé unique (slug déjà utilisé)
    if (error.code === 'P2002') {
      throw createError(errorCodes.ALREADY_EXISTS, 'Une ville avec ce slug existe déjà');
    }
    
    throw createError(errorCodes.DATABASE_ERROR, 'Erreur lors de la création de la ville');
  }
});

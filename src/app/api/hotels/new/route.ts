import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-middleware';
import { getAllCities } from '@/lib/db';

async function handler(request: NextRequest) {
  // Cette route est utilisée pour récupérer les données nécessaires à la création d'un hôtel
  const cities = await getAllCities();

  return NextResponse.json({
    cities: cities,
  });
}

export const GET = withErrorHandling(handler);

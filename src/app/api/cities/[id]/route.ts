import { NextRequest, NextResponse } from 'next/server';
import { getCityBySlug, getCityById, updateCity, deleteCity } from '@/lib/db';
import { withErrorHandling } from '@/lib/api-middleware';
import { invalidateCitiesCache } from '@/lib/cache';

async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Vérifier si c'est un slug ou un ID
  const isSlug = !id.includes('-'); // Hypothèse: les IDs contiennent des tirets (CUID)
  
  let city;
  if (isSlug) {
    city = await getCityBySlug(id);
  } else {
    city = await getCityById(id);
  }
  
  if (!city) {
    return NextResponse.json(
      { error: 'City not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(city);
}

async function handlePut(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();
  
  // Validation basique
  if (!body.name && !body.slug) {
    return NextResponse.json(
      { error: 'At least one field (name or slug) is required' },
      { status: 400 }
    );
  }
  
  // Mettre à jour la ville
  const city = await updateCity(id, {
    name: body.name,
    slug: body.slug,
  });
  
  // Invalider le cache des villes
  invalidateCitiesCache(id);
  
  return NextResponse.json(city);
}

async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Supprimer la ville
  await deleteCity(id);
  
  // Invalider le cache des villes
  invalidateCitiesCache(id);
  
  return new NextResponse(null, { status: 204 });
}

export const GET = withErrorHandling(handleGet);
export const PUT = withErrorHandling(handlePut);
export const DELETE = withErrorHandling(handleDelete);
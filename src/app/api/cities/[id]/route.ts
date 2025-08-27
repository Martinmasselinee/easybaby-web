import { NextRequest, NextResponse } from 'next/server';
import { getCityBySlug, updateCity, deleteCity } from '@/lib/db';
import { invalidateCitiesCache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Vérifier si c'est un slug ou un ID
    const isSlug = !id.includes('-'); // Hypothèse: les IDs contiennent des tirets (CUID)
    
    let city;
    if (isSlug) {
      city = await getCityBySlug(id);
    } else {
      // Utiliser getCityById si nécessaire (à implémenter dans db.ts)
      return NextResponse.json(
        { error: 'ID lookup not implemented yet' },
        { status: 501 }
      );
    }
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (error) {
    console.error('Error updating city:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de clé unique (slug déjà utilisé)
    if ((error as unknown).code === 'P2002') {
      return NextResponse.json(
        { error: 'A city with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update city' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Supprimer la ville
    await deleteCity(id);
    
    // Invalider le cache des villes
    invalidateCitiesCache(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting city:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de contrainte de clé étrangère
    if ((error as unknown).code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete city because it has related records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    );
  }
}

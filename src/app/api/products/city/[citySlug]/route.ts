import { NextRequest, NextResponse } from 'next/server';
import { getAllProductsByCity } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const { citySlug } = params;
    const products = await getAllProductsByCity(citySlug);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Erreur GET /api/products/city/[citySlug]:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des produits' }, { status: 500 });
  }
}
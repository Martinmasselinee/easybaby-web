import { NextResponse } from 'next/server';
import { getAllCitiesWithProductCount } from '@/lib/db';

export async function GET() {
  try {
    const cities = await getAllCitiesWithProductCount();
    
    // Transformer les données pour inclure le comptage des produits
    const citiesWithCounts = cities.map(city => {
      const uniqueProductIds = new Set(
        city.hotels.flatMap(hotel => 
          hotel.inventory.map(inv => inv.productId)
        )
      );
      
      return {
        id: city.id,
        slug: city.slug,
        name: city.name,
        hotelsCount: city._count.hotels,
        productsCount: uniqueProductIds.size,
      };
    });
    
    return NextResponse.json(citiesWithCounts);
  } catch (error: any) {
    console.error('Erreur GET /api/cities/counts:', error);
    // Retourner un array vide au lieu d'une erreur 500
    return NextResponse.json([]);
  }
}
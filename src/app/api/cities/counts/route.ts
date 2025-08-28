import { NextResponse } from 'next/server';
import { getAllCitiesWithProductCount } from '@/lib/db';

export async function GET() {
  try {
    const cities = await getAllCitiesWithProductCount();
    
    // Transformer les données pour inclure le comptage des produits
    const citiesWithCounts = cities.map(city => {
      // Calculer le nombre de produits uniques via l'inventaire des hôtels
      const uniqueProductIds = new Set();
      city.hotels.forEach(hotel => {
        hotel.inventory.forEach(item => {
          uniqueProductIds.add(item.productId);
        });
      });
      
      return {
        id: city.id,
        name: city.name,
        slug: city.slug,
        hotelsCount: city._count.hotels, // Correction du nom pour correspondre à l'interface
        productsCount: uniqueProductIds.size, // Correction du nom pour correspondre à l'interface
      };
    });
    
    return NextResponse.json(citiesWithCounts);
  } catch (error: any) {
    console.error('Erreur GET /api/cities/counts:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des villes avec compteurs' }, { status: 500 });
  }
}
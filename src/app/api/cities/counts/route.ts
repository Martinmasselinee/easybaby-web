import { NextResponse } from 'next/server';
import { getAllCitiesWithProductCount } from '@/lib/db';
import { withErrorHandling } from '@/lib/api-middleware';

async function handleGet() {
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
      hotelCount: city._count.hotels,
      productCount: uniqueProductIds.size,
    };
  });
  
  return NextResponse.json(citiesWithCounts);
}

export const GET = withErrorHandling(handleGet);
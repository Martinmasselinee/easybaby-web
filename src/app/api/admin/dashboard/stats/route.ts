import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Erreur GET /api/admin/dashboard/stats:', error);
    // Retourner des stats vides en cas d'erreur
    return NextResponse.json({
      reservationsCount: 0,
      hotelsCount: 0,
      productsCount: 0,
      citiesCount: 0,
      totalRevenueCents: 0,
    });
  }
}

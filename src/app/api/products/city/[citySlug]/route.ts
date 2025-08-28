import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-middleware';
import { getAllProductsByCity } from '@/lib/db';

async function handler(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  const { citySlug } = params;

  const products = await getAllProductsByCity(citySlug);

  return NextResponse.json(products);
}

export const GET = withErrorHandling(handler);
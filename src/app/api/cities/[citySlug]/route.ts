import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { citySlug: string } }
) {
  try {
    const { citySlug } = params;

    const city = await prisma.city.findUnique({
      where: {
        slug: citySlug,
      },
      include: {
        hotels: {
          include: {
            _count: {
              select: {
                inventory: true,
              },
            },
          },
        },
        _count: {
          select: {
            hotels: true,
          },
        },
      },
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(city);
  } catch (error: any) {
    console.error('Error GET /api/cities/[citySlug]:', error);
    return NextResponse.json(
      { error: 'Error loading city' },
      { status: 500 }
    );
  }
}

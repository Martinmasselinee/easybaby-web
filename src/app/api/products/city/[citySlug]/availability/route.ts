import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ citySlug: string }> }
) {
  try {
    const { citySlug } = await params;
    const { searchParams } = new URL(request.url);
    
    const arrival = searchParams.get('arrival');
    const departure = searchParams.get('departure');

    if (!arrival || !departure) {
      return NextResponse.json(
        { error: 'arrival and departure dates are required' },
        { status: 400 }
      );
    }

    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (arrivalDate >= departureDate) {
      return NextResponse.json(
        { error: 'Arrival date must be before departure date' },
        { status: 400 }
      );
    }

    // Get products with inventory in this city
    const products = await prisma.product.findMany({
      where: {
        inventory: {
          some: {
            hotel: {
              city: {
                slug: citySlug,
              },
            },
            active: true,
            quantity: {
              gt: 0,
            },
          },
        },
      },
      include: {
        inventory: {
          where: {
            hotel: {
              city: {
                slug: citySlug,
              },
            },
            active: true,
          },
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate availability for each product for the selected dates
    const productsWithAvailability = await Promise.all(
      products.map(async (product) => {
        // Calculate total quantity across all hotels in this city
        const totalQuantity = product.inventory.reduce((sum, item) => sum + item.quantity, 0);
        
        // Count overlapping reservations for this product across all hotels in the city
        const overlappingReservations = await prisma.reservation.count({
          where: {
            productId: product.id,
            pickupHotel: {
              city: {
                slug: citySlug,
              },
            },
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
            // Check for date overlap
            AND: [
              { startAt: { lt: departureDate } },
              { endAt: { gt: arrivalDate } },
            ],
          },
        });

        const availableQuantity = Math.max(0, totalQuantity - overlappingReservations);
        const uniqueHotels = new Set(product.inventory.map(item => item.hotel.id));

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          pricePerHour: product.pricePerHour,
          pricePerDay: product.pricePerDay,
          deposit: product.deposit,
          availability: {
            total: totalQuantity,
            available: availableQuantity,
            hotelsCount: uniqueHotels.size,
          },
        };
      })
    );

    // Return all products with availability info (including zero availability)
    return NextResponse.json(productsWithAvailability);
  } catch (error: any) {
    console.error('Error GET /api/products/city/[citySlug]/availability:', error);
    return NextResponse.json(
      { error: 'Error loading products with availability' },
      { status: 500 }
    );
  }
}

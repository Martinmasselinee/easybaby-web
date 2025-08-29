import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-middleware";

async function handleGet(request: NextRequest) {
  // Get current date for availability calculation
  const now = new Date();
  const currentEnd = new Date();
  currentEnd.setHours(23, 59, 59, 999); // End of today

  // Get all inventory with enhanced availability data
  const inventory = await prisma.inventoryItem.findMany({
    include: {
      hotel: {
        include: {
          city: true,
        },
      },
      product: true,
    },
    orderBy: [
      { hotel: { name: 'asc' } },
      { product: { name: 'asc' } },
    ],
  });

  // Calculate real-time availability for each inventory item
  const enhancedInventory = await Promise.all(
    inventory.map(async (item) => {
      // Count current active reservations
      const currentlyInUse = await prisma.reservation.count({
        where: {
          productId: item.productId,
          pickupHotelId: item.hotelId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          AND: [
            { startAt: { lte: now } },
            { endAt: { gte: now } },
          ],
        },
      });

      // Count total active reservations (including future ones)
      const totalReserved = await prisma.reservation.count({
        where: {
          productId: item.productId,
          pickupHotelId: item.hotelId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          endAt: { gte: now }, // Future or current reservations
        },
      });

      // Calculate availability metrics
      const currentlyAvailable = Math.max(0, item.quantity - currentlyInUse);
      const totalAvailable = Math.max(0, item.quantity - totalReserved);
      const inUse = currentlyInUse;
      const utilization = item.quantity > 0 ? (inUse / item.quantity) * 100 : 0;

      return {
        ...item,
        currentlyAvailable,
        totalAvailable,
        inUse,
        utilization: Math.round(utilization),
        isFullyBooked: currentlyAvailable === 0,
        isLowStock: currentlyAvailable <= 2 && currentlyAvailable > 0,
        hasRecentDemand: totalReserved > currentlyInUse, // Future bookings exist
      };
    })
  );

  // Add metadata for better insights
  const metadata = {
    totalItems: enhancedInventory.length,
    totalProducts: new Set(enhancedInventory.map(item => item.productId)).size,
    totalHotels: new Set(enhancedInventory.map(item => item.hotelId)).size,
    fullyBookedItems: enhancedInventory.filter(item => item.isFullyBooked).length,
    lowStockItems: enhancedInventory.filter(item => item.isLowStock).length,
    highDemandItems: enhancedInventory.filter(item => item.hasRecentDemand).length,
    averageUtilization: Math.round(
      enhancedInventory.reduce((sum, item) => sum + item.utilization, 0) / enhancedInventory.length
    ),
  };

  return NextResponse.json({
    inventory: enhancedInventory,
    metadata,
    timestamp: now.toISOString(),
  });
}

export const GET = withErrorHandling(handleGet);

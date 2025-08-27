import prisma from './prisma';

// Fonctions City
export async function getAllCities() {
  return await prisma.city.findMany({
    include: {
      _count: {
        select: {
          hotels: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getCityBySlug(slug: string) {
  return await prisma.city.findUnique({
    where: {
      slug,
    },
    include: {
      hotels: true,
      _count: {
        select: {
          hotels: true,
        },
      },
    },
  });
}

export async function createCity(data: { name: string; slug: string }) {
  return await prisma.city.create({
    data,
  });
}

export async function updateCity(id: string, data: { name?: string; slug?: string }) {
  return await prisma.city.update({
    where: { id },
    data,
  });
}

export async function deleteCity(id: string) {
  return await prisma.city.delete({
    where: { id },
  });
}

// Fonctions Hotel
export async function getAllHotels() {
  return await prisma.hotel.findMany({
    include: {
      city: true,
      discountCode: true,
      _count: {
        select: {
          inventory: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getHotelById(id: string) {
  return await prisma.hotel.findUnique({
    where: { id },
    include: {
      city: true,
      discountCode: true,
      inventory: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getHotelsByCityId(cityId: string) {
  return await prisma.hotel.findMany({
    where: {
      cityId,
    },
    include: {
      discountCode: true,
      _count: {
        select: {
          inventory: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createHotel(data: {
  name: string;
  address: string;
  email: string;
  phone?: string;
  contactName?: string;
  cityId: string;
}) {
  return await prisma.hotel.create({
    data,
  });
}

export async function updateHotel(
  id: string,
  data: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    contactName?: string;
    cityId?: string;
  }
) {
  return await prisma.hotel.update({
    where: { id },
    data,
  });
}

export async function deleteHotel(id: string) {
  return await prisma.hotel.delete({
    where: { id },
  });
}

// Fonctions DiscountCode
export async function createOrUpdateDiscountCode(
  hotelId: string,
  data: { code: string; kind: 'PLATFORM_70' | 'HOTEL_70'; active: boolean }
) {
  return await prisma.discountCode.upsert({
    where: {
      hotelId,
    },
    update: data,
    create: {
      ...data,
      hotelId,
    },
  });
}

export async function getDiscountCodeByCode(code: string) {
  return await prisma.discountCode.findUnique({
    where: {
      code,
    },
    include: {
      hotel: true,
    },
  });
}

// Fonctions Product
export async function getAllProducts() {
  return await prisma.product.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
}) {
  return await prisma.product.create({
    data,
  });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    pricePerHour?: number;
    pricePerDay?: number;
    deposit?: number;
  }
) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}

// Fonctions Inventory
export async function getInventoryByHotelId(hotelId: string) {
  return await prisma.inventoryItem.findMany({
    where: {
      hotelId,
    },
    include: {
      product: true,
    },
  });
}

export async function createOrUpdateInventoryItem(
  hotelId: string,
  productId: string,
  quantity: number
) {
  return await prisma.inventoryItem.upsert({
    where: {
      hotelId_productId: {
        hotelId,
        productId,
      },
    },
    update: {
      quantity,
    },
    create: {
      hotelId,
      productId,
      quantity,
    },
  });
}

export async function deleteInventoryItem(id: string) {
  return await prisma.inventoryItem.delete({
    where: { id },
  });
}

// Fonctions Reservation
export async function getAllReservations() {
  return await prisma.reservation.findMany({
    include: {
      city: true,
      pickupHotel: true,
      dropHotel: true,
      product: true,
      discountCode: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getReservationById(id: string) {
  return await prisma.reservation.findUnique({
    where: { id },
    include: {
      city: true,
      pickupHotel: true,
      dropHotel: true,
      product: true,
      discountCode: true,
    },
  });
}

export async function getReservationByCode(code: string) {
  return await prisma.reservation.findUnique({
    where: { code },
    include: {
      city: true,
      pickupHotel: true,
      dropHotel: true,
      product: true,
      discountCode: true,
    },
  });
}

export async function createReservation(data: {
  code: string;
  userEmail: string;
  userPhone?: string;
  cityId: string;
  pickupHotelId: string;
  dropHotelId: string;
  productId: string;
  startAt: Date;
  endAt: Date;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'DAMAGED' | 'CANCELLED';
  durationHours: number;
  durationDays: number;
  pricingType: 'HOURLY' | 'DAILY';
  priceCents: number;
  depositCents: number;
  stripePaymentIntentId?: string;
  stripeSetupIntentId?: string;
  discountCodeId?: string;
  revenueShareApplied: 'PLATFORM_70' | 'HOTEL_70';
}) {
  return await prisma.reservation.create({
    data,
  });
}

export async function updateReservationStatus(
  id: string,
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'DAMAGED' | 'CANCELLED'
) {
  return await prisma.reservation.update({
    where: { id },
    data: { status },
  });
}

// Fonction pour vérifier la disponibilité d'un produit
export async function checkProductAvailability(
  productId: string,
  hotelId: string,
  startAt: Date,
  endAt: Date
) {
  // 1. Obtenir l'inventaire total pour ce produit dans cet hôtel
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      hotelId_productId: {
        hotelId,
        productId,
      },
    },
  });

  if (!inventoryItem) {
    return {
      available: false,
      totalQuantity: 0,
      availableQuantity: 0,
    };
  }

  // 2. Compter les réservations actives qui chevauchent la période demandée
  const overlappingReservations = await prisma.reservation.count({
    where: {
      productId,
      pickupHotelId: hotelId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
      // Chevauchement: startA < endB AND endA > startB
      AND: [
        {
          startAt: { lt: endAt },
        },
        {
          endAt: { gt: startAt },
        },
      ],
    },
  });

  const availableQuantity = Math.max(0, inventoryItem.quantity - overlappingReservations);

  return {
    available: availableQuantity > 0,
    totalQuantity: inventoryItem.quantity,
    availableQuantity,
  };
}

// Fonction pour obtenir les statistiques du tableau de bord
export async function getDashboardStats() {
  const [reservationsCount, hotelsCount, productsCount, citiesCount, totalRevenue] =
    await Promise.all([
      prisma.reservation.count(),
      prisma.hotel.count(),
      prisma.product.count(),
      prisma.city.count(),
      prisma.reservation.aggregate({
        _sum: {
          priceCents: true,
        },
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      }),
    ]);

  return {
    reservationsCount,
    hotelsCount,
    productsCount,
    citiesCount,
    totalRevenueCents: totalRevenue._sum.priceCents || 0,
  };
}

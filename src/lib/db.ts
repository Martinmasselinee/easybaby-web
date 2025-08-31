import { prisma } from './prisma';

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

// Version optimisée pour la page publique avec comptage des produits
export async function getAllCitiesWithProductCount() {
  return await prisma.city.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          hotels: true,
        },
      },
      hotels: {
        select: {
          inventory: {
            select: {
              productId: true,
            },
          },
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

export async function getCityById(id: string) {
  return await prisma.city.findUnique({
    where: { id },
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

export async function getAllProductsByCity(citySlug: string) {
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

  // Calculate availability for each product
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
          // For now, we'll consider all future reservations as unavailable
          // In a more sophisticated implementation, we'd check date ranges
          endAt: {
            gt: new Date(),
          },
        },
      });

      const availableQuantity = Math.max(0, totalQuantity - overlappingReservations);

      return {
        ...product,
        availability: {
          total: totalQuantity,
          available: availableQuantity,
          hotelsCount: product.inventory.length,
        },
      };
    })
  );

  return productsWithAvailability;
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
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      pickupHotel: {
        select: {
          id: true,
          name: true,
        },
      },
      dropHotel: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      discountCode: {
        select: {
          id: true,
          code: true,
          kind: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Version paginée optimisée
export async function getReservationsPaginated(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    productId?: string;
    hotelId?: string;
    search?: string;
  }
) {
  const skip = (page - 1) * limit;
  
  const where: any = {};
  
  if (filters?.status && filters.status !== 'all') {
    where.status = filters.status;
  }
  
  if (filters?.productId && filters.productId !== 'all') {
    where.productId = filters.productId;
  }
  
  if (filters?.hotelId) {
    where.OR = [
      { pickupHotelId: filters.hotelId },
      { dropHotelId: filters.hotelId },
    ];
  }
  
  if (filters?.search) {
    where.OR = [
      { code: { contains: filters.search, mode: 'insensitive' } },
      { userEmail: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [reservations, totalCount] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        pickupHotel: {
          select: {
            id: true,
            name: true,
          },
        },
        dropHotel: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        discountCode: {
          select: {
            id: true,
            code: true,
            kind: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  return {
    reservations,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    },
  };
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

// Fonction pour marquer un produit comme endommagé avec déduction de caution
export async function markReservationAsDamaged(
  reservationId: string,
  adminNotes?: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error('Réservation non trouvée');
  }

  // Marquer comme endommagé et déduire la caution
  return await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'DAMAGED',
      // Note: Dans un vrai système, on créerait une entrée dans une table de transactions
      // pour traquer la déduction de caution
    },
  });
}

// Fonction pour marquer un produit comme volé avec déduction de caution
export async function markReservationAsStolen(
  reservationId: string,
  adminNotes?: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error('Réservation non trouvée');
  }

  // Marquer comme volé (utilise NO_SHOW) et déduire la caution
  return await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'NO_SHOW', // Représente le vol dans notre système
      // Note: Dans un vrai système, on créerait une entrée dans une table de transactions
      // pour traquer la déduction de caution
    },
  });
}

// Fonction pour obtenir les réservations avec statuts calculés dynamiquement
export async function getReservationsWithDynamicStatus() {
  const reservations = await getAllReservations();
  
  // Le calcul du statut dynamique sera fait côté client
  // pour éviter les problèmes de timezone et permettre le real-time
  return reservations;
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

// Version optimisée pour vérifier la disponibilité de plusieurs produits/hôtels
export async function checkMultipleProductAvailability(
  checks: Array<{
    productId: string;
    hotelId: string;
    startAt: Date;
    endAt: Date;
  }>
) {
  if (checks.length === 0) return [];

  // 1. Obtenir tous les inventaires en une seule requête
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      OR: checks.map(check => ({
        hotelId: check.hotelId,
        productId: check.productId,
      })),
    },
  });

  // 2. Obtenir toutes les réservations qui pourraient chevaucher en une seule requête
  const allReservations = await prisma.reservation.findMany({
    where: {
      OR: checks.map(check => ({
        productId: check.productId,
        pickupHotelId: check.hotelId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        AND: [
          { startAt: { lt: check.endAt } },
          { endAt: { gt: check.startAt } },
        ],
      })),
    },
    select: {
      productId: true,
      pickupHotelId: true,
      startAt: true,
      endAt: true,
    },
  });

  // 3. Calculer la disponibilité pour chaque vérification
  return checks.map(check => {
    const inventory = inventoryItems.find(
      item => item.hotelId === check.hotelId && item.productId === check.productId
    );

    if (!inventory) {
      return {
        ...check,
        available: false,
        totalQuantity: 0,
        availableQuantity: 0,
      };
    }

    const overlappingCount = allReservations.filter(
      reservation =>
        reservation.productId === check.productId &&
        reservation.pickupHotelId === check.hotelId &&
        reservation.startAt < check.endAt &&
        reservation.endAt > check.startAt
    ).length;

    const availableQuantity = Math.max(0, inventory.quantity - overlappingCount);

    return {
      ...check,
      available: availableQuantity > 0,
      totalQuantity: inventory.quantity,
      availableQuantity,
    };
  });
}

// Fonction pour obtenir les dates disponibles pour un produit dans un hôtel
export async function getAvailableDatesForProduct(
  productId: string,
  hotelId: string,
  startDate?: Date,
  endDate?: Date
) {
  const now = startDate || new Date();
  const maxDate = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 jours

  // Obtenir l'inventaire
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      hotelId_productId: {
        hotelId,
        productId,
      },
    },
  });

  if (!inventoryItem || inventoryItem.quantity === 0) {
    return [];
  }

  // Obtenir toutes les réservations dans la période
  const reservations = await prisma.reservation.findMany({
    where: {
      productId,
      pickupHotelId: hotelId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
      startAt: { gte: now },
      endAt: { lte: maxDate },
    },
    select: {
      startAt: true,
      endAt: true,
    },
    orderBy: {
      startAt: 'asc',
    },
  });

  // Générer les dates disponibles (logique simplifiée)
  const availableDates: Array<{ start: string; end: string }> = [];
  const currentDate = new Date(now);
  
  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDay = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000);
    
    // Vérifier s'il y a des réservations qui chevauchent cette date
    const hasConflict = reservations.some(
      reservation =>
        checkDate < reservation.endAt && nextDay > reservation.startAt
    );
    
    if (!hasConflict) {
      availableDates.push({
        start: checkDate.toISOString().split('T')[0],
        end: nextDay.toISOString().split('T')[0],
      });
    }
  }

  return availableDates;
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

// === INVENTORY FUNCTIONS ===
export async function getAllInventory() {
  return await prisma.inventoryItem.findMany({
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
}

export async function createInventoryItem(data: {
  hotelId: string;
  productId: string;
  quantity: number;
  active?: boolean;
}) {
  return await prisma.inventoryItem.create({
    data: {
      hotelId: data.hotelId,
      productId: data.productId,
      quantity: data.quantity,
      active: data.active ?? true,
    },
    include: {
      hotel: {
        include: {
          city: true,
        },
      },
      product: true,
    },
  });
}

export async function updateInventoryItem(id: string, data: {
  quantity?: number;
  active?: boolean;
}) {
  return await prisma.inventoryItem.update({
    where: { id },
    data,
    include: {
      hotel: {
        include: {
          city: true,
        },
      },
      product: true,
    },
  });
}

// Basket Management Functions
export async function createShoppingBasket(userEmail: string, sessionId?: string) {
  return await prisma.shoppingBasket.create({
    data: {
      userEmail,
      sessionId,
      status: 'ACTIVE',
    },
  });
}

export async function getBasketById(basketId: string) {
  return await prisma.shoppingBasket.findUnique({
    where: { id: basketId },
    include: {
      items: {
        include: {
          product: true,
          pickupHotel: true,
          dropHotel: true,
        },
      },
    },
  });
}

export async function getBasketByEmail(email: string) {
  return await prisma.shoppingBasket.findFirst({
    where: { 
      userEmail: email,
      status: 'ACTIVE',
    },
    include: {
      items: {
        include: {
          product: true,
          pickupHotel: true,
          dropHotel: true,
        },
      },
    },
  });
}

export async function getBasketBySession(sessionId: string) {
  return await prisma.shoppingBasket.findFirst({
    where: { 
      sessionId,
      status: 'ACTIVE',
    },
    include: {
      items: {
        include: {
          product: true,
          pickupHotel: true,
          dropHotel: true,
        },
      },
    },
  });
}

export async function updateBasketStatus(basketId: string, status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'ABANDONED') {
  return await prisma.shoppingBasket.update({
    where: { id: basketId },
    data: { status },
  });
}

export async function addItemToBasket(basketId: string, itemData: {
  productId: string;
  pickupHotelId: string;
  dropHotelId: string;
  pickupDate: Date;
  dropDate: Date;
  quantity: number;
  priceCents: number;
  depositCents: number;
}) {
  return await prisma.basketItem.create({
    data: {
      basketId,
      ...itemData,
    },
    include: {
      product: true,
      pickupHotel: true,
      dropHotel: true,
    },
  });
}

export async function updateBasketItem(itemId: string, itemData: Partial<{
  pickupHotelId: string;
  dropHotelId: string;
  pickupDate: Date;
  dropDate: Date;
  quantity: number;
  priceCents: number;
  depositCents: number;
}>) {
  return await prisma.basketItem.update({
    where: { id: itemId },
    data: itemData,
    include: {
      product: true,
      pickupHotel: true,
      dropHotel: true,
    },
  });
}

export async function removeBasketItem(itemId: string) {
  return await prisma.basketItem.delete({
    where: { id: itemId },
  });
}

export async function getBasketItems(basketId: string) {
  return await prisma.basketItem.findMany({
    where: { basketId },
    include: {
      product: true,
      pickupHotel: true,
      dropHotel: true,
    },
  });
}

// Multi-Item Availability Functions
export async function checkBasketAvailability(basketItems: Array<{
  productId: string;
  pickupHotelId: string;
  dropHotelId: string;
  pickupDate: Date;
  dropDate: Date;
  quantity: number;
}>) {
  if (basketItems.length === 0) return [];

  // Use existing optimized function
  const availabilityChecks = basketItems.map(item => ({
    productId: item.productId,
    hotelId: item.pickupHotelId,
    startAt: item.pickupDate,
    endAt: item.dropDate,
  }));

  const results = await checkMultipleProductAvailability(availabilityChecks);
  
  // Check for conflicts within the same basket
  const conflicts = findBasketConflicts(basketItems, results);
  
  return {
    available: conflicts.length === 0,
    conflicts,
    availabilityResults: results,
  };
}

function findBasketConflicts(basketItems: Array<{
  productId: string;
  pickupHotelId: string;
  pickupDate: Date;
  dropDate: Date;
}>, availabilityResults: any[]) {
  const conflicts = [];
  
  // Check for overlapping dates for same product/hotel
  for (let i = 0; i < basketItems.length; i++) {
    for (let j = i + 1; j < basketItems.length; j++) {
      const item1 = basketItems[i];
      const item2 = basketItems[j];
      
      if (item1.productId === item2.productId && 
          item1.pickupHotelId === item2.pickupHotelId) {
        
        // Check date overlap
        if (item1.pickupDate < item2.dropDate && item1.dropDate > item2.pickupDate) {
          conflicts.push({
            type: 'DATE_OVERLAP',
            item1: item1,
            item2: item2,
            message: 'Same product cannot be rented for overlapping dates',
          });
        }
      }
    }
  }
  
  return conflicts;
}

export async function validateBasketItems(basketId: string) {
  const basket = await getBasketById(basketId);
  if (!basket) {
    return { valid: false, error: 'Basket not found' };
  }

  const availabilityCheck = await checkBasketAvailability(
    basket.items.map(item => ({
      productId: item.productId,
      pickupHotelId: item.pickupHotelId,
      dropHotelId: item.dropHotelId,
      pickupDate: item.pickupDate,
      dropDate: item.dropDate,
      quantity: item.quantity,
    }))
  );

  return {
    valid: availabilityCheck.available,
    conflicts: availabilityCheck.conflicts,
    availabilityResults: availabilityCheck.availabilityResults,
  };
}

// Basket Reservation Functions
export async function createBasketReservation(basketId: string, userData: {
  userEmail: string;
  userPhone?: string;
  cityId: string;
  totalPriceCents: number;
  totalDepositCents: number;
}) {
  const reservationCode = generateReservationCode();
  
  return await prisma.basketReservation.create({
    data: {
      basketId,
      reservationCode,
      ...userData,
    },
    include: {
      basket: {
        include: {
          items: {
            include: {
              product: true,
              pickupHotel: true,
              dropHotel: true,
            },
          },
        },
      },
    },
  });
}

function generateReservationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'EZB-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

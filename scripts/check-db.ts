const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database for existing data...');

  // Check if we have any cities
  const cities = await prisma.city.findMany();
  console.log(`Found ${cities.length} cities`);

  // Check if we have any products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products`);

  // Check if we have any hotels
  const hotels = await prisma.hotel.findMany();
  console.log(`Found ${hotels.length} hotels`);

  // Check if we have any inventory
  const inventory = await prisma.inventoryItem.findMany();
  console.log(`Found ${inventory.length} inventory items`);

  // If no data exists, create some test data
  if (cities.length === 0) {
    console.log('Creating test data...');
    
    // Create a city
    const city = await prisma.city.create({
      data: {
        name: 'Paris',
        slug: 'paris',
      },
    });

    // Create a hotel
    const hotel = await prisma.hotel.create({
      data: {
        name: 'Hotel de Paris',
        address: '123 Rue de la Paix, 75001 Paris',
        email: 'contact@hoteldeparis.com',
        cityId: city.id,
      },
    });

    // Create products
    const poussette = await prisma.product.create({
      data: {
        name: 'Poussette',
        description: 'Poussette confortable pour bébé',
        pricePerHour: 500, // 5€ per hour
        pricePerDay: 2500, // 25€ per day
        deposit: 10000, // 100€ deposit
      },
    });

    const litParapluie = await prisma.product.create({
      data: {
        name: 'Lit parapluie',
        description: 'Lit parapluie pliable et léger',
        pricePerHour: 300, // 3€ per hour
        pricePerDay: 1500, // 15€ per day
        deposit: 8000, // 80€ deposit
      },
    });

    // Create inventory
    await prisma.inventoryItem.createMany({
      data: [
        {
          hotelId: hotel.id,
          productId: poussette.id,
          quantity: 5,
          active: true,
        },
        {
          hotelId: hotel.id,
          productId: litParapluie.id,
          quantity: 3,
          active: true,
        },
      ],
    });

    console.log('Test data created successfully!');
  } else {
    console.log('Database already has data.');
  }

  // Show current inventory
  const currentInventory = await prisma.inventoryItem.findMany({
    include: {
      hotel: {
        include: {
          city: true,
        },
      },
      product: true,
    },
  });

  console.log('\nCurrent inventory:');
  currentInventory.forEach((item: any) => {
    console.log(`${item.product.name} at ${item.hotel.name} (${item.hotel.city.name}): ${item.quantity} units`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

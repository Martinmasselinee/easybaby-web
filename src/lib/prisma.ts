import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la limite de connexions à la base de données pendant le hot-reloading
declare global {
  var __prisma: PrismaClient | undefined;
  var __prismaConnectionCount: number | undefined;
}

// Configuration robuste pour Turbopack + Prisma
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Hook pour gérer les déconnexions proprement
  if (typeof window === 'undefined') {
    // Incrémenter le compteur de connexions
    global.__prismaConnectionCount = (global.__prismaConnectionCount || 0) + 1;
    
    // Déconnecter proprement en cas d'arrêt
    const disconnect = async () => {
      try {
        await client.$disconnect();
      } catch (error) {
        console.warn('Error disconnecting Prisma client:', error);
      }
    };

    // Gestion des signaux système
    process.on('SIGINT', disconnect);
    process.on('SIGTERM', disconnect);
    process.on('beforeExit', disconnect);
  }

  return client;
};

// Fonction pour obtenir ou créer le client Prisma
const getPrismaClient = () => {
  if (global.__prisma) {
    // Vérifier si le client existant est encore fonctionnel
    try {
      global.__prisma.$connect();
      return global.__prisma;
    } catch (error) {
      console.warn('Existing Prisma client disconnected, creating new one');
      global.__prisma = undefined;
    }
  }

  const client = createPrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = client;
  }

  return client;
};

// Export du client singleton avec lazy initialization
export const prisma = getPrismaClient();

// Fonction pour forcer une nouvelle connexion si nécessaire
export const getFreshPrismaClient = async () => {
  if (global.__prisma) {
    try {
      await global.__prisma.$disconnect();
    } catch (error) {
      console.warn('Error disconnecting existing client:', error);
    }
    global.__prisma = undefined;
  }
  
  return getPrismaClient();
};

// Helper pour exécuter des opérations avec retry en cas d'erreur de prepared statement
export const withPrismaRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Si c'est une erreur de prepared statement, on retry avec un nouveau client
    if (error.message?.includes('prepared statement') && error.message?.includes('already exists')) {
      console.warn('Prepared statement conflict detected, retrying with fresh client');
      const freshClient = await getFreshPrismaClient();
      
      // Remplacer temporairement le client global
      const originalClient = global.__prisma;
      global.__prisma = freshClient;
      
      try {
        return await operation();
      } finally {
        // Restaurer le client original
        global.__prisma = originalClient;
      }
    }
    throw error;
  }
};

export default prisma;
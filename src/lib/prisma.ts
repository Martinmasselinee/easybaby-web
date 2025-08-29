import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la limite de connexions à la base de données pendant le hot-reloading
declare global {
  var prisma: PrismaClient | undefined;
}

// Configuration spécifique pour éviter les conflits avec Turbopack
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ['query', 'error', 'warn'] : ['error'],
  });

  // Gérer les déconnexions proprement pour éviter les prepared statements conflicts
  if (typeof window === 'undefined') {
    const originalExit = process.exit;
    process.exit = (code?: number) => {
      client.$disconnect().finally(() => originalExit(code));
    };
  }

  return client;
};

// Utiliser un singleton pour le client Prisma
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la limite de connexions à la base de données pendant le hot-reloading
declare global {
  var prisma: PrismaClient | undefined;
}

// Utiliser un singleton pour le client Prisma - VERSION SIMPLE QUI MARCHE
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ['error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la limite de connexions à la base de données pendant le hot-reloading
declare global {
  var prisma: PrismaClient | undefined;
}

// Utiliser un singleton pour le client Prisma
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
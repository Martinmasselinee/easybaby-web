import { PrismaClient } from '@prisma/client';

// SOLUTION POUR SUPABASE : désactiver les prepared statements qui causent des conflits avec la connection pool
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1&prepared_statements=false'
    }
  }
});

export default prisma;
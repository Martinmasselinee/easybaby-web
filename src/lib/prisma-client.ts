import { PrismaClient } from "@prisma/client";
import { logger, MetricsLogger } from './logger';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ]
      : [
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ]
  });

  // Logger les requêtes en développement
  if (process.env.NODE_ENV === "development") {
    client.$on('query', (e) => {
      logger.debug('Prisma Query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target,
      });
    });
  }

  // Logger les erreurs Prisma
  client.$on('error', (e) => {
    logger.error('Prisma Error', undefined, {
      message: e.message,
      target: e.target,
    });
  });

  // Logger les warnings Prisma
  client.$on('warn', (e) => {
    logger.warn('Prisma Warning', {
      message: e.message,
      target: e.target,
    });
  });

  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Wrapper pour logger les opérations de base de données
export function withDbLogging<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  table: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      MetricsLogger.logDatabaseQuery(
        operation,
        table,
        duration,
        Array.isArray(result) ? result.length : result ? 1 : 0
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.dbError(
        `Database ${operation} failed on ${table}`,
        error as Error,
        undefined,
        args[0]
      );
      
      MetricsLogger.logDatabaseQuery(operation, table, duration, 0);
      throw error;
    }
  }) as T;
}
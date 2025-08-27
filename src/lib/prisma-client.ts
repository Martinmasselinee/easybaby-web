import { PrismaClient } from "@prisma/client";

// Approche directe sans complexité
const prisma = new PrismaClient();

export { prisma };
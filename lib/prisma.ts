import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// El generador "prisma-client" (a diferencia del clásico
// "prisma-client-js") solo acepta URLs prisma:// o prisma+postgres://
// sin un driver adapter: con @prisma/adapter-pg sí puede conectar a
// una URL postgresql:// normal (Supabase u otro Postgres).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

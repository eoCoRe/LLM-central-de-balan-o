import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// Reusa a mesma instância entre hot-reloads do `next dev` — sem isso, cada
// recarregamento de módulo abriria um novo pool de conexões com o Postgres.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada — veja .env.example")
  }
  const adapter = new PrismaPg(connectionString)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

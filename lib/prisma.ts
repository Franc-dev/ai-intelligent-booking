import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not found. Please set it in your .env file")
  console.warn("   Example: DATABASE_URL=\"postgresql://username:password@localhost:5432/dbname\"")
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

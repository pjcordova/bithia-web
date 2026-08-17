import { PrismaClient } from "@prisma/client";

// En serverless cada invocación puede reutilizar el proceso. Sin este singleton
// el hot-reload de `next dev` abre una conexión nueva por recarga y agota el
// pool de Neon.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

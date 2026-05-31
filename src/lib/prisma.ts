import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function assertDatabaseUrl(): void {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return;

  const hint =
    process.env.NODE_ENV === "development"
      ? [
          "Missing DATABASE_URL.",
          "",
          "1. Copy .env.example to .env in the project root (same folder as package.json).",
          "2. Paste your Neon Postgres pooled connection string as DATABASE_URL.",
          "3. Set DIRECT_URL to the Neon direct connection string.",
          "4. Restart the dev server: npm run dev",
          "",
          "See docs/DEPLOYMENT.md for Neon setup.",
        ].join("\n")
      : "Missing DATABASE_URL environment variable.";

  throw new Error(hint);
}

assertDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

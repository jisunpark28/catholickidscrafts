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

/** Use in routes/libs — fails fast with a clear message if generate/migrate was skipped. */
export function getPrismaClient(): PrismaClient {
  const client = prisma;
  if (!client) {
    throw new Error("Prisma client failed to initialize. Check DATABASE_URL in .env.");
  }
  const account = (client as PrismaClient & { familyAccount?: unknown }).familyAccount;
  if (!account) {
    throw new Error(
      "Prisma client is missing FamilyAccount. Run: npx prisma generate && npx prisma migrate deploy — then restart pnpm dev.",
    );
  }
  return client;
}

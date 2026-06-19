import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const FAMILY_ACCOUNT_MISSING =
  "Prisma client is missing FamilyAccount. Run: npx prisma generate && npx prisma migrate deploy — then restart pnpm dev.";

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

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function hasFamilyAccountDelegate(client: PrismaClient): boolean {
  return Boolean(
    (client as PrismaClient & { familyAccount?: { findUnique?: unknown } }).familyAccount
      ?.findUnique,
  );
}

/** Dev hot-reload can keep a PrismaClient from before `prisma generate`; recreate once. */
function ensurePrismaClient(): PrismaClient {
  let client = globalForPrisma.prisma ?? createPrismaClient();

  if (!hasFamilyAccountDelegate(client)) {
    if (process.env.NODE_ENV === "development" && globalForPrisma.prisma) {
      void globalForPrisma.prisma.$disconnect().catch(() => {});
      client = createPrismaClient();
    }
    if (!hasFamilyAccountDelegate(client)) {
      throw new Error(FAMILY_ACCOUNT_MISSING);
    }
  }

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

assertDatabaseUrl();

export const prisma = ensurePrismaClient();

/** Use in routes/libs — fails fast with a clear message if generate/migrate was skipped. */
export function getPrismaClient(): PrismaClient {
  return ensurePrismaClient();
}

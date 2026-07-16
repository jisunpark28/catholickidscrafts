/**
 * Idempotent: add new default home hub pills (e.g. Prayers) on existing DBs.
 * Safe to run on every Vercel build and in production seed.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureMissingHomeItems } from "../prisma/seed-home-sections-lib";

async function main() {
  const prisma = new PrismaClient();
  try {
    await ensureMissingHomeItems(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

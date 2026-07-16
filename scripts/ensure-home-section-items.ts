/**
 * Idempotent: add new default home hub pills (e.g. Prayers) on existing DBs.
 * Safe to run on every Vercel build and in production seed.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureMissingHomeItems } from "../prisma/seed-home-sections-lib";
import { shouldContinuePreviewBuildAfterDbStep } from "./vercel-build-helpers";

const HOME_ITEMS_TIMEOUT_MS = 45_000;

async function main() {
  const prisma = new PrismaClient();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    console.error("ensure-home-section-items timed out");
    void prisma.$disconnect().finally(() => {
      if (shouldContinuePreviewBuildAfterDbStep("ensure-home-section-items", "timed out", true)) {
        process.exit(0);
      }
      process.exit(1);
    });
  }, HOME_ITEMS_TIMEOUT_MS);

  try {
    await ensureMissingHomeItems(prisma);
  } finally {
    clearTimeout(timeout);
    if (!timedOut) {
      await prisma.$disconnect();
    }
  }
}

main().catch((e) => {
  console.error(e);
  const message = e instanceof Error ? e.message : String(e);
  if (shouldContinuePreviewBuildAfterDbStep("ensure-home-section-items", message, false)) {
    process.exit(0);
  }
  process.exit(1);
});

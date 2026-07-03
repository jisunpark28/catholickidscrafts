/**
 * Idempotent production seed: lesson templates + home hub.
 * Lesson templates are always upserted by shareSlug (safe to re-run).
 * Home sections skip when already present (unless FORCE_PROD_SEED=true).
 * Set RUN_FULL_SEED=true to also run `prisma db seed` (needs ADMIN_EMAIL / ADMIN_PASSWORD).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import { seedLessonKits } from "../prisma/seed-lesson-kits";
import { seedHomeSections } from "../prisma/seed-home-sections-lib";

async function main() {
  const force = process.env.FORCE_PROD_SEED === "true";
  const runFull = process.env.RUN_FULL_SEED === "true";

  const prisma = new PrismaClient();
  try {
    const homeCount = await prisma.homeSection.count();

    console.log("Upserting global lesson templates…");
    await seedLessonKits(prisma);

    if (force || homeCount === 0) {
      await seedHomeSections(prisma);
      console.log("Home sections seeded.");
    } else {
      console.log("Home sections already exist — skip (set FORCE_PROD_SEED=true to re-run).");
    }

    console.log("Production seed done (lesson kits + home sections as needed).");

    if (runFull) {
      if (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD) {
        throw new Error(
          "RUN_FULL_SEED requires ADMIN_EMAIL and ADMIN_PASSWORD secrets.",
        );
      }
      console.log("Running full prisma db seed…");
      execSync("pnpm exec prisma db seed", { stdio: "inherit", env: process.env });
      console.log("Full seed done.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

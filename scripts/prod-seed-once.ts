/**
 * Idempotent production seed: lesson templates + home hub.
 * Skips when GLOBAL_TEMPLATE kits and home sections already exist (unless FORCE_PROD_SEED=true).
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
    const [templateCount, homeCount] = await Promise.all([
      prisma.lessonKit.count({ where: { scope: "GLOBAL_TEMPLATE" } }),
      prisma.homeSection.count(),
    ]);

    if (!force && templateCount > 0 && homeCount > 0) {
      console.log(
        "Production seed already applied (lesson templates + home sections). Nothing to do.",
      );
      console.log("Set FORCE_PROD_SEED=true to run again.");
      return;
    }

    console.log("Running production seed (lesson kits + home sections)…");
    await seedLessonKits(prisma);
    await seedHomeSections(prisma);
    console.log("Lesson kits + home sections done.");

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

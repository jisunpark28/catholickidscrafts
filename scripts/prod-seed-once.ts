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

type CountDelegate = { count: () => Promise<number> };

function prismaDelegate(client: PrismaClient, name: string): CountDelegate | null {
  const delegate = (client as unknown as Record<string, unknown>)[name];
  if (!delegate || typeof (delegate as CountDelegate).count !== "function") {
    return null;
  }
  return delegate as CountDelegate;
}

function missingClientHint(model: string): string {
  return (
    `Prisma client is missing model "${model}" (stale @prisma/client).\n` +
    "Run:\n" +
    "  pnpm exec prisma generate\n" +
    "  pnpm run db:migrate-deploy\n" +
    "Then retry:\n" +
    "  pnpm run db:seed-production-once"
  );
}

async function main() {
  const force = process.env.FORCE_PROD_SEED === "true";
  const runFull = process.env.RUN_FULL_SEED === "true";

  const prisma = new PrismaClient();
  try {
    if (!prismaDelegate(prisma, "lessonKit")) {
      throw new Error(missingClientHint("lessonKit"));
    }

    console.log("Upserting global lesson templates…");
    await seedLessonKits(prisma);

    const homeSection = prismaDelegate(prisma, "homeSection");
    if (!homeSection) {
      console.warn(missingClientHint("homeSection"));
      console.warn("Lesson templates were upserted; home sections were skipped.");
    } else {
      const homeCount = await homeSection.count();
      if (force || homeCount === 0) {
        await seedHomeSections(prisma);
        console.log("Home sections seeded.");
      } else {
        console.log("Home sections already exist — skip (set FORCE_PROD_SEED=true to re-run).");
      }
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

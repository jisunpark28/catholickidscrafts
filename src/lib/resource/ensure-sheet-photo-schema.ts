import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

/** Idempotent DDL for Plus sheet photo uploads (quota tracking). */
export async function ensureSheetPhotoSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SheetPhoto" (
          "id" TEXT NOT NULL,
          "familyAccountId" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "sizeBytes" INTEGER NOT NULL,
          "width" INTEGER,
          "height" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SheetPhoto_pkey" PRIMARY KEY ("id")
        )
      `);
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SheetPhoto_familyAccountId_createdAt_idx" ON "SheetPhoto"("familyAccountId", "createdAt")`,
      );
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "SheetPhoto"
            ADD CONSTRAINT "SheetPhoto_familyAccountId_fkey"
            FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
      } catch {
        /* already exists */
      }
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  await ready;
}

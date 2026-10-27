import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

/** Idempotent DDL so preview/prod can serve CustomSheet before migrate deploy finishes. */
export async function ensureCustomSheetSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CustomSheet" (
          "id" TEXT NOT NULL,
          "familyAccountId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "baseKey" TEXT NOT NULL,
          "level" INTEGER NOT NULL,
          "baseRev" TEXT NOT NULL,
          "data" JSONB NOT NULL,
          "thumbUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "CustomSheet_pkey" PRIMARY KEY ("id")
        )
      `);
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "CustomSheet_familyAccountId_updatedAt_idx" ON "CustomSheet"("familyAccountId", "updatedAt")`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "CustomSheet_familyAccountId_baseKey_level_idx" ON "CustomSheet"("familyAccountId", "baseKey", "level")`,
      );
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "CustomSheet"
            ADD CONSTRAINT "CustomSheet_familyAccountId_fkey"
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

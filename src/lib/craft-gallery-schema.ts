import { PrismaClient } from "@prisma/client";
import { getDirectDatabaseUrl } from "@/lib/neon-database-url";
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;
let ddlClient: PrismaClient | undefined;

function getDdlPrisma(): PrismaClient {
  if (!ddlClient) {
    ddlClient = new PrismaClient({
      datasources: { db: { url: getDirectDatabaseUrl() } },
      log: ["error"],
    });
  }
  return ddlClient;
}

export function ensureCraftGallerySchema(): Promise<void> {
  if (!ready) {
    ready = applyCraftGallerySchema().catch((e) => {
      ready = null;
      console.error("ensureCraftGallerySchema failed", e);
      throw e;
    });
  }
  return ready;
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = ${table}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function exec(sql: string): Promise<void> {
  await getDdlPrisma().$executeRawUnsafe(sql);
}

async function ensureCraftGalleryTable(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS "CraftGallerySubmission" (
      "id" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "authorName" TEXT NOT NULL,
      "caption" TEXT,
      "resourceId" TEXT,
      "familyAccountId" TEXT,
      "isApproved" BOOLEAN NOT NULL DEFAULT false,
      "rejectedAt" TIMESTAMP(3),
      "moderatedById" TEXT,
      "moderatedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CraftGallerySubmission_pkey" PRIMARY KEY ("id")
    )
  `);
}

async function ensureIndexesAndConstraints(): Promise<void> {
  await exec(
    `CREATE INDEX IF NOT EXISTS "CraftGallerySubmission_isApproved_createdAt_idx" ON "CraftGallerySubmission"("isApproved", "createdAt")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "CraftGallerySubmission_resourceId_idx" ON "CraftGallerySubmission"("resourceId")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "CraftGallerySubmission_familyAccountId_idx" ON "CraftGallerySubmission"("familyAccountId")`,
  );

  await exec(`
    DO $$ BEGIN
      ALTER TABLE "CraftGallerySubmission"
        ADD CONSTRAINT "CraftGallerySubmission_resourceId_fkey"
        FOREIGN KEY ("resourceId") REFERENCES "Resource"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "CraftGallerySubmission"
        ADD CONSTRAINT "CraftGallerySubmission_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "CraftGallerySubmission"
        ADD CONSTRAINT "CraftGallerySubmission_moderatedById_fkey"
        FOREIGN KEY ("moderatedById") REFERENCES "AdminUser"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
}

async function applyCraftGallerySchema(): Promise<void> {
  if (await tableExists("CraftGallerySubmission")) {
    return;
  }

  await ensureCraftGalleryTable();
  await ensureIndexesAndConstraints();
}

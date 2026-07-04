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

/** Idempotent DDL so comments work even if migrate deploy was skipped or failed mid-deploy. */
export function ensureLessonKitCommentsSchema(): Promise<void> {
  if (!ready) {
    ready = applyLessonKitCommentsSchema().catch((e) => {
      ready = null;
      console.error("ensureLessonKitCommentsSchema failed", e);
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

async function ensureCommentTable(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS "LessonKitComment" (
      "id" TEXT NOT NULL,
      "kitId" TEXT NOT NULL,
      "familyAccountId" TEXT,
      "authorName" TEXT,
      "body" TEXT NOT NULL,
      "parentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LessonKitComment_pkey" PRIMARY KEY ("id")
    )
  `);
}

async function ensureIndexes(): Promise<void> {
  await exec(
    `CREATE INDEX IF NOT EXISTS "LessonKitComment_kitId_createdAt_idx" ON "LessonKitComment"("kitId", "createdAt")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "LessonKitComment_parentId_idx" ON "LessonKitComment"("parentId")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "LessonKitComment_familyAccountId_idx" ON "LessonKitComment"("familyAccountId")`,
  );
}

async function ensureForeignKeys(): Promise<void> {
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "LessonKitComment"
        ADD CONSTRAINT "LessonKitComment_kitId_fkey"
        FOREIGN KEY ("kitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "LessonKitComment"
        ADD CONSTRAINT "LessonKitComment_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "LessonKitComment"
        ADD CONSTRAINT "LessonKitComment_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "LessonKitComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
}

async function applyLessonKitCommentsSchema(): Promise<void> {
  if (await tableExists("LessonKitComment")) {
    await ensureIndexes();
    await ensureForeignKeys();
    return;
  }
  await ensureCommentTable();
  await ensureIndexes();
  await ensureForeignKeys();
}

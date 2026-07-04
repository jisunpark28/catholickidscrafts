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

/** Idempotent DDL so discussion works even if migrate deploy was skipped on deploy. */
export function ensureDiscussionSchema(): Promise<void> {
  if (!ready) {
    ready = applyDiscussionSchema().catch((e) => {
      ready = null;
      console.error("ensureDiscussionSchema failed", e);
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

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = ${table}
        AND a.attname = ${column}
        AND a.attnum > 0
        AND NOT a.attisdropped
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function exec(sql: string): Promise<void> {
  await getDdlPrisma().$executeRawUnsafe(sql);
}

async function ensureThreadTable(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS "BibleChapterThread" (
      "id" TEXT NOT NULL,
      "bookSlug" TEXT NOT NULL,
      "chapter" INTEGER NOT NULL,
      "body" TEXT NOT NULL,
      "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
      "authorLabel" TEXT NOT NULL,
      "familyAccountId" TEXT,
      "subProfileId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BibleChapterThread_pkey" PRIMARY KEY ("id")
    )
  `);
}

async function ensureCommentTable(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS "BibleChapterComment" (
      "id" TEXT NOT NULL,
      "threadId" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
      "authorLabel" TEXT NOT NULL,
      "familyAccountId" TEXT,
      "subProfileId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BibleChapterComment_pkey" PRIMARY KEY ("id")
    )
  `);
}

async function ensureIndexesAndConstraints(): Promise<void> {
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_bookSlug_chapter_createdAt_idx" ON "BibleChapterThread"("bookSlug", "chapter", "createdAt")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_familyAccountId_idx" ON "BibleChapterThread"("familyAccountId")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_subProfileId_idx" ON "BibleChapterThread"("subProfileId")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_threadId_createdAt_idx" ON "BibleChapterComment"("threadId", "createdAt")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_familyAccountId_idx" ON "BibleChapterComment"("familyAccountId")`,
  );
  await exec(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_subProfileId_idx" ON "BibleChapterComment"("subProfileId")`,
  );

  await exec(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterThread"
        ADD CONSTRAINT "BibleChapterThread_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterThread"
        ADD CONSTRAINT "BibleChapterThread_subProfileId_fkey"
        FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterComment"
        ADD CONSTRAINT "BibleChapterComment_threadId_fkey"
        FOREIGN KEY ("threadId") REFERENCES "BibleChapterThread"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterComment"
        ADD CONSTRAINT "BibleChapterComment_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await exec(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterComment"
        ADD CONSTRAINT "BibleChapterComment_subProfileId_fkey"
        FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
}

async function applyDiscussionSchema(): Promise<void> {
  const hasThread = await tableExists("BibleChapterThread");
  const hasComment = await tableExists("BibleChapterComment");
  const hasOwnerPenName = await columnExists("FamilyAccount", "discussionPenName");
  const hasSubPenName = await columnExists("SubProfile", "discussionPenName");

  // Typical production path after migrate deploy: skip direct DDL entirely.
  if (hasThread && hasComment && hasOwnerPenName && hasSubPenName) {
    return;
  }

  if (!hasOwnerPenName) {
    await exec(`ALTER TABLE "FamilyAccount" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
  }
  if (!hasSubPenName) {
    await exec(`ALTER TABLE "SubProfile" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
  }
  if (!hasThread) {
    await ensureThreadTable();
  }
  if (!hasComment) {
    await ensureCommentTable();
  }

  await ensureIndexesAndConstraints();
}

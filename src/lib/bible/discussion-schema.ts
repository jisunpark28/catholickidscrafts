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

/** Clear cached bootstrap so a later request can retry DDL (tests / recovery). */
export function resetDiscussionSchemaCache(): void {
  ready = null;
}

async function discussionSchemaIsQueryable(): Promise<boolean> {
  try {
    await prisma.bibleChapterThread.findFirst({ select: { id: true } });
    await prisma.bibleChapterComment.findFirst({ select: { id: true } });
    await prisma.familyAccount.findFirst({ select: { discussionPenName: true } });
    return true;
  } catch {
    return false;
  }
}

async function exec(sql: string): Promise<void> {
  try {
    await getDdlPrisma().$executeRawUnsafe(sql);
    return;
  } catch (directError) {
    console.warn("discussion DDL via direct URL failed; retrying on pooled connection", directError);
  }

  await prisma.$executeRawUnsafe(sql);
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
  if (await discussionSchemaIsQueryable()) {
    return;
  }

  await exec(`ALTER TABLE "FamilyAccount" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
  await exec(`ALTER TABLE "SubProfile" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
  await ensureThreadTable();
  await ensureCommentTable();
  await ensureIndexesAndConstraints();

  if (!(await discussionSchemaIsQueryable())) {
    throw new Error("Bible discussion schema bootstrap finished but tables are still not queryable");
  }
}

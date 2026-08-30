import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { getDirectDatabaseUrl } from "@/lib/neon-database-url";
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;
let ddlClient: PrismaClient | undefined;
let neonPool: Pool | undefined;

function getNeonPool(): Pool {
  if (!neonPool) {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL");
    }
    neonConfig.poolQueryViaFetch = true;
    neonPool = new Pool({ connectionString });
  }
  return neonPool;
}

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

async function discussionTablesQueryable(): Promise<boolean> {
  try {
    await prisma.bibleChapterThread.findFirst({ select: { id: true } });
    await prisma.bibleChapterComment.findFirst({ select: { id: true } });
    return true;
  } catch {
    return false;
  }
}

async function penNameColumnsQueryable(): Promise<boolean> {
  try {
    await prisma.familyAccount.findFirst({ select: { discussionPenName: true } });
    await prisma.subProfile.findFirst({ select: { discussionPenName: true } });
    return true;
  } catch {
    return false;
  }
}

async function exec(sql: string): Promise<void> {
  const errors: unknown[] = [];

  try {
    await getNeonPool().query(sql);
    return;
  } catch (neonError) {
    errors.push(neonError);
    console.warn("discussion DDL via Neon HTTP failed; retrying direct Prisma", neonError);
  }

  try {
    await getDdlPrisma().$executeRawUnsafe(sql);
    return;
  } catch (directError) {
    errors.push(directError);
    console.warn("discussion DDL via direct Prisma failed; retrying pooled Prisma", directError);
  }

  try {
    await prisma.$executeRawUnsafe(sql);
    return;
  } catch (pooledError) {
    errors.push(pooledError);
  }

  throw errors[0];
}

async function ensurePenNameColumns(): Promise<void> {
  await exec(`ALTER TABLE "FamilyAccount" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
  await exec(`ALTER TABLE "SubProfile" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT`);
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

async function execOptional(sql: string): Promise<void> {
  try {
    await exec(sql);
  } catch (error) {
    console.warn("discussion optional DDL skipped", error);
  }
}

async function ensureIndexesAndConstraints(): Promise<void> {
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_bookSlug_chapter_createdAt_idx" ON "BibleChapterThread"("bookSlug", "chapter", "createdAt")`,
  );
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_familyAccountId_idx" ON "BibleChapterThread"("familyAccountId")`,
  );
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterThread_subProfileId_idx" ON "BibleChapterThread"("subProfileId")`,
  );
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_threadId_createdAt_idx" ON "BibleChapterComment"("threadId", "createdAt")`,
  );
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_familyAccountId_idx" ON "BibleChapterComment"("familyAccountId")`,
  );
  await execOptional(
    `CREATE INDEX IF NOT EXISTS "BibleChapterComment_subProfileId_idx" ON "BibleChapterComment"("subProfileId")`,
  );

  await execOptional(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterThread"
        ADD CONSTRAINT "BibleChapterThread_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await execOptional(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterThread"
        ADD CONSTRAINT "BibleChapterThread_subProfileId_fkey"
        FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await execOptional(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterComment"
        ADD CONSTRAINT "BibleChapterComment_threadId_fkey"
        FOREIGN KEY ("threadId") REFERENCES "BibleChapterThread"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await execOptional(`
    DO $$ BEGIN
      ALTER TABLE "BibleChapterComment"
        ADD CONSTRAINT "BibleChapterComment_familyAccountId_fkey"
        FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await execOptional(`
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
  const tablesReady = await discussionTablesQueryable();
  const penNamesReady = await penNameColumnsQueryable();

  if (!tablesReady || !penNamesReady) {
    if (!penNamesReady) {
      await ensurePenNameColumns();
    }
    if (!tablesReady) {
      await ensureThreadTable();
      await ensureCommentTable();
      await ensureIndexesAndConstraints();
    }
  }

  if (!(await discussionTablesQueryable())) {
    throw new Error("Bible discussion tables are still not queryable after bootstrap");
  }
  if (!(await penNameColumnsQueryable())) {
    throw new Error("discussionPenName columns are still not queryable after bootstrap");
  }
}

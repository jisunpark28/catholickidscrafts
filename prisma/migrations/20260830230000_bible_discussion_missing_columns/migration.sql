-- Recovery: partial bootstrap may have created stub tables missing many columns.
-- CREATE TABLE IF NOT EXISTS does not alter existing tables.
-- When both tables are empty and familyAccountId is missing, drop and recreate.

DO $$
DECLARE
  thread_count bigint := 0;
  comment_count bigint := 0;
  has_family_col boolean := false;
BEGIN
  IF to_regclass('"BibleChapterThread"') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM "BibleChapterThread"' INTO thread_count;
  END IF;
  IF to_regclass('"BibleChapterComment"') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM "BibleChapterComment"' INTO comment_count;
  END IF;
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'BibleChapterThread'
      AND column_name = 'familyAccountId'
  ) INTO has_family_col;

  IF thread_count = 0 AND comment_count = 0 AND NOT has_family_col THEN
    DROP TABLE IF EXISTS "BibleChapterComment" CASCADE;
    DROP TABLE IF EXISTS "BibleChapterThread" CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "BibleChapterThread" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "authorLabel" TEXT NOT NULL DEFAULT '',
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BibleChapterThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BibleChapterComment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "authorLabel" TEXT NOT NULL DEFAULT '',
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BibleChapterComment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "bookSlug" TEXT;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "chapter" INTEGER;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "body" TEXT;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "authorLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "familyAccountId" TEXT;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "subProfileId" TEXT;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "threadId" TEXT;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "body" TEXT;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "authorLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "familyAccountId" TEXT;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "subProfileId" TEXT;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "BibleChapterThread_bookSlug_chapter_createdAt_idx" ON "BibleChapterThread"("bookSlug", "chapter", "createdAt");
CREATE INDEX IF NOT EXISTS "BibleChapterThread_familyAccountId_idx" ON "BibleChapterThread"("familyAccountId");
CREATE INDEX IF NOT EXISTS "BibleChapterThread_subProfileId_idx" ON "BibleChapterThread"("subProfileId");
CREATE INDEX IF NOT EXISTS "BibleChapterComment_threadId_createdAt_idx" ON "BibleChapterComment"("threadId", "createdAt");
CREATE INDEX IF NOT EXISTS "BibleChapterComment_familyAccountId_idx" ON "BibleChapterComment"("familyAccountId");
CREATE INDEX IF NOT EXISTS "BibleChapterComment_subProfileId_idx" ON "BibleChapterComment"("subProfileId");

DO $$ BEGIN
  ALTER TABLE "BibleChapterThread"
    ADD CONSTRAINT "BibleChapterThread_familyAccountId_fkey"
    FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BibleChapterThread"
    ADD CONSTRAINT "BibleChapterThread_subProfileId_fkey"
    FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BibleChapterComment"
    ADD CONSTRAINT "BibleChapterComment_threadId_fkey"
    FOREIGN KEY ("threadId") REFERENCES "BibleChapterThread"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BibleChapterComment"
    ADD CONSTRAINT "BibleChapterComment_familyAccountId_fkey"
    FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BibleChapterComment"
    ADD CONSTRAINT "BibleChapterComment_subProfileId_fkey"
    FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

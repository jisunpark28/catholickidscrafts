-- Idempotent recovery when runtime bootstrap partially applied or tables were dropped.
ALTER TABLE "FamilyAccount" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT;
ALTER TABLE "SubProfile" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT;

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
);

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
);

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

-- Recovery: tables created by an older bootstrap may lack isAnonymous / authorLabel.
-- CREATE TABLE IF NOT EXISTS does not add columns to existing tables.

ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BibleChapterThread" ADD COLUMN IF NOT EXISTS "authorLabel" TEXT NOT NULL DEFAULT '';

ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BibleChapterComment" ADD COLUMN IF NOT EXISTS "authorLabel" TEXT NOT NULL DEFAULT '';

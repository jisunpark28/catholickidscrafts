-- Teacher community sharing for personal lesson kits (PR-11).
ALTER TABLE "LessonKit" ADD COLUMN IF NOT EXISTS "communityVisible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LessonKit" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "LessonKit" ADD COLUMN IF NOT EXISTS "authorDisplayName" TEXT;

CREATE INDEX IF NOT EXISTS "LessonKit_communityVisible_publishedAt_idx"
  ON "LessonKit"("communityVisible", "publishedAt");

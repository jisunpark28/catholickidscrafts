-- Teacher feedback on community lesson kits (PR-13).
CREATE TABLE IF NOT EXISTS "LessonKitComment" (
  "id" TEXT NOT NULL,
  "kitId" TEXT NOT NULL,
  "familyAccountId" TEXT,
  "authorName" TEXT,
  "body" TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LessonKitComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LessonKitComment_kitId_createdAt_idx"
  ON "LessonKitComment"("kitId", "createdAt");
CREATE INDEX IF NOT EXISTS "LessonKitComment_parentId_idx"
  ON "LessonKitComment"("parentId");
CREATE INDEX IF NOT EXISTS "LessonKitComment_familyAccountId_idx"
  ON "LessonKitComment"("familyAccountId");

DO $$ BEGIN
  ALTER TABLE "LessonKitComment"
    ADD CONSTRAINT "LessonKitComment_kitId_fkey"
    FOREIGN KEY ("kitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LessonKitComment"
    ADD CONSTRAINT "LessonKitComment_familyAccountId_fkey"
    FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LessonKitComment"
    ADD CONSTRAINT "LessonKitComment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "LessonKitComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

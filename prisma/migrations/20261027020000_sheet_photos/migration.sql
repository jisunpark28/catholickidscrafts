-- Plus custom-sheet photo uploads (quota + EXIF-stripped WebP URLs).
CREATE TABLE IF NOT EXISTS "SheetPhoto" (
    "id" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SheetPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SheetPhoto_familyAccountId_createdAt_idx"
  ON "SheetPhoto"("familyAccountId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "SheetPhoto"
    ADD CONSTRAINT "SheetPhoto_familyAccountId_fkey"
    FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Plus custom Sunday sheets (diff over locked base).
CREATE TABLE IF NOT EXISTS "CustomSheet" (
    "id" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseKey" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "baseRev" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "thumbUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSheet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomSheet_familyAccountId_updatedAt_idx" ON "CustomSheet"("familyAccountId", "updatedAt");
CREATE INDEX IF NOT EXISTS "CustomSheet_familyAccountId_baseKey_level_idx" ON "CustomSheet"("familyAccountId", "baseKey", "level");

DO $$ BEGIN
  ALTER TABLE "CustomSheet"
    ADD CONSTRAINT "CustomSheet_familyAccountId_fkey"
    FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

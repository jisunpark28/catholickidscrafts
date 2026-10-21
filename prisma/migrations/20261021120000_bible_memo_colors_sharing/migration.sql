-- Memo phase 3: highlight colors + family sharing.
-- Backfill colors so the column can become required (non-destructive).
UPDATE "BiblePassageMemo"
SET "color" = 'yellow'
WHERE "color" IS NULL OR "color" NOT IN ('yellow', 'sky', 'green', 'pink', 'purple');

-- DISCUSSION is reserved and never exposed; keep any stray rows private.
UPDATE "BiblePassageMemo" SET "visibility" = 'PRIVATE' WHERE "visibility" = 'DISCUSSION';

-- AlterTable
ALTER TABLE "BiblePassageMemo" ALTER COLUMN "color" SET DEFAULT 'yellow',
ALTER COLUMN "color" SET NOT NULL;

-- CreateIndex
CREATE INDEX "BiblePassageMemo_visibility_idx" ON "BiblePassageMemo"("visibility");

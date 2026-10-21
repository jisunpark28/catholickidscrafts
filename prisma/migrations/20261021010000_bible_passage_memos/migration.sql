-- CreateEnum
CREATE TYPE "BibleMemoVisibility" AS ENUM ('PRIVATE', 'FAMILY', 'DISCUSSION');

-- CreateTable
CREATE TABLE "BiblePassageMemo" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "startVerse" INTEGER NOT NULL,
    "endVerse" INTEGER NOT NULL,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "quotedText" TEXT NOT NULL,
    "textVersion" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "color" TEXT,
    "visibility" "BibleMemoVisibility" NOT NULL DEFAULT 'PRIVATE',
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiblePassageMemo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BiblePassageMemo_familyAccountId_bookSlug_chapter_idx" ON "BiblePassageMemo"("familyAccountId", "bookSlug", "chapter");

-- CreateIndex
CREATE INDEX "BiblePassageMemo_subProfileId_bookSlug_chapter_idx" ON "BiblePassageMemo"("subProfileId", "bookSlug", "chapter");

-- CreateIndex
CREATE INDEX "BiblePassageMemo_bookSlug_chapter_idx" ON "BiblePassageMemo"("bookSlug", "chapter");

-- AddForeignKey
ALTER TABLE "BiblePassageMemo" ADD CONSTRAINT "BiblePassageMemo_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiblePassageMemo" ADD CONSTRAINT "BiblePassageMemo_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

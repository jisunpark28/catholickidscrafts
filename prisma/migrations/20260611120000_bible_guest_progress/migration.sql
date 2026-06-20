-- AlterTable
ALTER TABLE "BibleChapterProgress" ADD COLUMN "guestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BibleChapterProgress_guestId_bookSlug_chapter_key" ON "BibleChapterProgress"("guestId", "bookSlug", "chapter");

-- CreateIndex
CREATE INDEX "BibleChapterProgress_guestId_idx" ON "BibleChapterProgress"("guestId");

-- AlterTable
ALTER TABLE "FamilyAccount" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT;

-- AlterTable
ALTER TABLE "SubProfile" ADD COLUMN IF NOT EXISTS "discussionPenName" TEXT;

-- CreateTable
CREATE TABLE "BibleChapterThread" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "authorLabel" TEXT NOT NULL,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleChapterThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleChapterComment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "authorLabel" TEXT NOT NULL,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleChapterComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BibleChapterThread_bookSlug_chapter_createdAt_idx" ON "BibleChapterThread"("bookSlug", "chapter", "createdAt");

-- CreateIndex
CREATE INDEX "BibleChapterThread_familyAccountId_idx" ON "BibleChapterThread"("familyAccountId");

-- CreateIndex
CREATE INDEX "BibleChapterThread_subProfileId_idx" ON "BibleChapterThread"("subProfileId");

-- CreateIndex
CREATE INDEX "BibleChapterComment_threadId_createdAt_idx" ON "BibleChapterComment"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "BibleChapterComment_familyAccountId_idx" ON "BibleChapterComment"("familyAccountId");

-- CreateIndex
CREATE INDEX "BibleChapterComment_subProfileId_idx" ON "BibleChapterComment"("subProfileId");

-- AddForeignKey
ALTER TABLE "BibleChapterThread" ADD CONSTRAINT "BibleChapterThread_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterThread" ADD CONSTRAINT "BibleChapterThread_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterComment" ADD CONSTRAINT "BibleChapterComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BibleChapterThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterComment" ADD CONSTRAINT "BibleChapterComment_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterComment" ADD CONSTRAINT "BibleChapterComment_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

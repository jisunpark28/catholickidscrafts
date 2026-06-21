-- CreateTable
CREATE TABLE "BibleChapterThread" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "authorTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleChapterThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleChapterComment" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleChapterComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BibleChapterThread_bookSlug_chapter_createdAt_idx" ON "BibleChapterThread"("bookSlug", "chapter", "createdAt");

-- CreateIndex
CREATE INDEX "BibleChapterComment_threadId_createdAt_idx" ON "BibleChapterComment"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "BibleChapterComment" ADD CONSTRAINT "BibleChapterComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BibleChapterThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

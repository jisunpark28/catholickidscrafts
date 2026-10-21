-- CreateEnum
CREATE TYPE "LiturgyQaStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "LiturgyQaTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bigIdea" TEXT NOT NULL DEFAULT '',
    "ageNote" TEXT NOT NULL DEFAULT '',
    "accentColor" TEXT NOT NULL DEFAULT '#d35400',
    "cardBackColor" TEXT NOT NULL DEFAULT '#fff4ea',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiturgyQaTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiturgyQaCard" (
    "id" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tryThis" TEXT NOT NULL DEFAULT '',
    "iconFallback" TEXT NOT NULL DEFAULT '',
    "imageFilename" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "imageScene" TEXT NOT NULL DEFAULT '',
    "imagePrompt" TEXT NOT NULL DEFAULT '',
    "altText" TEXT NOT NULL DEFAULT '',
    "cardColor" TEXT NOT NULL DEFAULT '',
    "status" "LiturgyQaStatus" NOT NULL DEFAULT 'DRAFT',
    "internalSourceRef" TEXT NOT NULL DEFAULT '',
    "reviewNote" TEXT NOT NULL DEFAULT '',
    "adminEditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiturgyQaCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiturgyQaTopic_slug_key" ON "LiturgyQaTopic"("slug");

-- CreateIndex
CREATE INDEX "LiturgyQaCard_topicSlug_status_sortOrder_idx" ON "LiturgyQaCard"("topicSlug", "status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LiturgyQaCard_topicSlug_sortOrder_key" ON "LiturgyQaCard"("topicSlug", "sortOrder");

-- AddForeignKey
ALTER TABLE "LiturgyQaCard" ADD CONSTRAINT "LiturgyQaCard_topicSlug_fkey" FOREIGN KEY ("topicSlug") REFERENCES "LiturgyQaTopic"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

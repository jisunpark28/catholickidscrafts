-- CreateEnum
CREATE TYPE "RecommendationKind" AS ENUM ('VIDEO', 'BOOK', 'TEMPLATE', 'AUDIO', 'WEBSITE', 'OTHER');

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "kind" "RecommendationKind" NOT NULL DEFAULT 'OTHER',
    "externalUrl" TEXT NOT NULL,
    "author" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_slug_key" ON "Recommendation"("slug");
CREATE INDEX "Recommendation_kind_idx" ON "Recommendation"("kind");
CREATE INDEX "Recommendation_published_idx" ON "Recommendation"("published");

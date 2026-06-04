-- CreateEnum
CREATE TYPE "PhotoBoothLayout" AS ENUM ('SINGLE', 'STRIP', 'BOTH');

-- CreateTable
CREATE TABLE "PhotoBoothFrame" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "layout" "PhotoBoothLayout" NOT NULL DEFAULT 'BOTH',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoBoothFrame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoBoothFrame_slug_key" ON "PhotoBoothFrame"("slug");

-- CreateIndex
CREATE INDEX "PhotoBoothFrame_published_idx" ON "PhotoBoothFrame"("published");

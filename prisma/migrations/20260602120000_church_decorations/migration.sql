-- CreateTable
CREATE TABLE "ChurchDecoration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 2.2,
    "posZ" DOUBLE PRECISION NOT NULL DEFAULT -6,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 1.4,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 1.4,
    "rotationY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchDecoration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChurchDecoration_slug_key" ON "ChurchDecoration"("slug");

-- CreateIndex
CREATE INDEX "ChurchDecoration_published_idx" ON "ChurchDecoration"("published");

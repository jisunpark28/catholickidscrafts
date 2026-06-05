-- CreateTable
CREATE TABLE "SiteCopy" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "hint" TEXT,
    "format" TEXT NOT NULL DEFAULT 'plain',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteCopy_key_key" ON "SiteCopy"("key");

-- CreateIndex
CREATE INDEX "SiteCopy_group_idx" ON "SiteCopy"("group");

-- CreateIndex
CREATE INDEX "SiteCopy_published_idx" ON "SiteCopy"("published");

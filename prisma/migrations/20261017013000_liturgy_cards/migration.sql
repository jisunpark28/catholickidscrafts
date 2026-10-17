-- CreateTable
CREATE TABLE "LiturgyCard" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "href" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiturgyCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiturgyCard_topic_sortOrder_idx" ON "LiturgyCard"("topic", "sortOrder");

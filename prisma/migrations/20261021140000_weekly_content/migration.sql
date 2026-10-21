-- CreateTable
CREATE TABLE "WeeklyIssue" (
    "id" TEXT NOT NULL,
    "sundayDate" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT '',
    "cycle" TEXT NOT NULL DEFAULT '',
    "gospelRef" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyItem" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL DEFAULT '',
    "topic" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyIssue_sundayDate_key" ON "WeeklyIssue"("sundayDate");

-- CreateIndex
CREATE INDEX "WeeklyIssue_published_sundayDate_idx" ON "WeeklyIssue"("published", "sundayDate");

-- CreateIndex
CREATE INDEX "WeeklyItem_issueId_sortOrder_idx" ON "WeeklyItem"("issueId", "sortOrder");

-- CreateIndex
CREATE INDEX "WeeklyItem_topic_idx" ON "WeeklyItem"("topic");

-- AddForeignKey
ALTER TABLE "WeeklyItem" ADD CONSTRAINT "WeeklyItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "WeeklyIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
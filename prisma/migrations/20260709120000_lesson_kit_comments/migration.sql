-- Teacher feedback on community lesson kits (PR-13).
-- CreateTable
CREATE TABLE "LessonKitComment" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "familyAccountId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonKitComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonKitComment_kitId_createdAt_idx" ON "LessonKitComment"("kitId", "createdAt");

-- CreateIndex
CREATE INDEX "LessonKitComment_parentId_idx" ON "LessonKitComment"("parentId");

-- CreateIndex
CREATE INDEX "LessonKitComment_familyAccountId_idx" ON "LessonKitComment"("familyAccountId");

-- AddForeignKey
ALTER TABLE "LessonKitComment" ADD CONSTRAINT "LessonKitComment_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKitComment" ADD CONSTRAINT "LessonKitComment_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKitComment" ADD CONSTRAINT "LessonKitComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LessonKitComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

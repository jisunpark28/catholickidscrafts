-- CreateTable
CREATE TABLE "CraftGallerySubmission" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "caption" TEXT,
    "resourceId" TEXT,
    "familyAccountId" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "rejectedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CraftGallerySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CraftGallerySubmission_isApproved_createdAt_idx" ON "CraftGallerySubmission"("isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "CraftGallerySubmission_resourceId_idx" ON "CraftGallerySubmission"("resourceId");

-- CreateIndex
CREATE INDEX "CraftGallerySubmission_familyAccountId_idx" ON "CraftGallerySubmission"("familyAccountId");

-- AddForeignKey
ALTER TABLE "CraftGallerySubmission" ADD CONSTRAINT "CraftGallerySubmission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftGallerySubmission" ADD CONSTRAINT "CraftGallerySubmission_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftGallerySubmission" ADD CONSTRAINT "CraftGallerySubmission_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

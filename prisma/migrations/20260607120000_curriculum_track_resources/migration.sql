-- Per-track resource display order for curriculum pages.
CREATE TABLE "CurriculumTrackResource" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumTrackResource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CurriculumTrackResource_trackId_resourceId_key" ON "CurriculumTrackResource"("trackId", "resourceId");
CREATE INDEX "CurriculumTrackResource_trackId_sortOrder_idx" ON "CurriculumTrackResource"("trackId", "sortOrder");

ALTER TABLE "CurriculumTrackResource" ADD CONSTRAINT "CurriculumTrackResource_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "CurriculumTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CurriculumTrackResource" ADD CONSTRAINT "CurriculumTrackResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lesson personas: assignments, progress, parish plans (Phases 3–4)

CREATE TABLE "LessonAssignment" (
    "id" TEXT NOT NULL,
    "lessonKitId" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "subProfileId" TEXT,
    "weekStart" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonKitProgress" (
    "id" TEXT NOT NULL,
    "lessonKitId" TEXT NOT NULL,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,
    "guestId" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonKitProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParishPlan" (
    "id" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "lessonKitId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParishPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonAssignment_lessonKitId_familyAccountId_subProfileId_weekStart_key" ON "LessonAssignment"("lessonKitId", "familyAccountId", "subProfileId", "weekStart");
CREATE INDEX "LessonAssignment_familyAccountId_weekStart_idx" ON "LessonAssignment"("familyAccountId", "weekStart");
CREATE INDEX "LessonAssignment_subProfileId_weekStart_idx" ON "LessonAssignment"("subProfileId", "weekStart");

CREATE INDEX "LessonKitProgress_lessonKitId_idx" ON "LessonKitProgress"("lessonKitId");
CREATE INDEX "LessonKitProgress_familyAccountId_idx" ON "LessonKitProgress"("familyAccountId");
CREATE INDEX "LessonKitProgress_subProfileId_idx" ON "LessonKitProgress"("subProfileId");
CREATE INDEX "LessonKitProgress_guestId_idx" ON "LessonKitProgress"("guestId");

CREATE INDEX "ParishPlan_parishId_weekStart_idx" ON "ParishPlan"("parishId", "weekStart");

ALTER TABLE "LessonAssignment" ADD CONSTRAINT "LessonAssignment_lessonKitId_fkey" FOREIGN KEY ("lessonKitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonAssignment" ADD CONSTRAINT "LessonAssignment_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonAssignment" ADD CONSTRAINT "LessonAssignment_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonKitProgress" ADD CONSTRAINT "LessonKitProgress_lessonKitId_fkey" FOREIGN KEY ("lessonKitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonKitProgress" ADD CONSTRAINT "LessonKitProgress_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonKitProgress" ADD CONSTRAINT "LessonKitProgress_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParishPlan" ADD CONSTRAINT "ParishPlan_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParishPlan" ADD CONSTRAINT "ParishPlan_lessonKitId_fkey" FOREIGN KEY ("lessonKitId") REFERENCES "LessonKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

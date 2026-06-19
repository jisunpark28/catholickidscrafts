-- CreateTable
CREATE TABLE "GospelDayProgress" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typingAccuracy" DOUBLE PRECISION,
    "guestId" TEXT,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,

    CONSTRAINT "GospelDayProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GospelDayProgress_guestId_dateKey_key" ON "GospelDayProgress"("guestId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "GospelDayProgress_familyAccountId_dateKey_key" ON "GospelDayProgress"("familyAccountId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "GospelDayProgress_subProfileId_dateKey_key" ON "GospelDayProgress"("subProfileId", "dateKey");

-- CreateIndex
CREATE INDEX "GospelDayProgress_dateKey_idx" ON "GospelDayProgress"("dateKey");

-- AddForeignKey
ALTER TABLE "GospelDayProgress" ADD CONSTRAINT "GospelDayProgress_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GospelDayProgress" ADD CONSTRAINT "GospelDayProgress_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

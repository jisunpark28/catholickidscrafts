-- CreateTable
CREATE TABLE "TypingDraft" (
    "id" TEXT NOT NULL,
    "draftKey" TEXT NOT NULL,
    "typedText" TEXT NOT NULL,
    "elapsedMs" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guestId" TEXT,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,

    CONSTRAINT "TypingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TypingDraft_guestId_draftKey_key" ON "TypingDraft"("guestId", "draftKey");

-- CreateIndex
CREATE UNIQUE INDEX "TypingDraft_familyAccountId_draftKey_key" ON "TypingDraft"("familyAccountId", "draftKey");

-- CreateIndex
CREATE UNIQUE INDEX "TypingDraft_subProfileId_draftKey_key" ON "TypingDraft"("subProfileId", "draftKey");

-- CreateIndex
CREATE INDEX "TypingDraft_draftKey_idx" ON "TypingDraft"("draftKey");

-- AddForeignKey
ALTER TABLE "TypingDraft" ADD CONSTRAINT "TypingDraft_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypingDraft" ADD CONSTRAINT "TypingDraft_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

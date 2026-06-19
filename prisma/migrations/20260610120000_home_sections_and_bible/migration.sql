-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSectionItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubProfile" (
    "id" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "accessCodeHash" TEXT NOT NULL,
    "accessCodeLast4" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleChapterProgress" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typingAccuracy" DOUBLE PRECISION,
    "familyAccountId" TEXT,
    "subProfileId" TEXT,

    CONSTRAINT "BibleChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeSection_published_sortOrder_idx" ON "HomeSection"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "HomeSectionItem_sectionId_sortOrder_idx" ON "HomeSectionItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "HomeSectionItem_published_idx" ON "HomeSectionItem"("published");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyAccount_email_key" ON "FamilyAccount"("email");

-- CreateIndex
CREATE INDEX "SubProfile_familyAccountId_sortOrder_idx" ON "SubProfile"("familyAccountId", "sortOrder");

-- CreateIndex
CREATE INDEX "BibleChapterProgress_bookSlug_chapter_idx" ON "BibleChapterProgress"("bookSlug", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "BibleChapterProgress_familyAccountId_bookSlug_chapter_key" ON "BibleChapterProgress"("familyAccountId", "bookSlug", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "BibleChapterProgress_subProfileId_bookSlug_chapter_key" ON "BibleChapterProgress"("subProfileId", "bookSlug", "chapter");

-- AddForeignKey
ALTER TABLE "HomeSectionItem" ADD CONSTRAINT "HomeSectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProfile" ADD CONSTRAINT "SubProfile_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterProgress" ADD CONSTRAINT "BibleChapterProgress_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleChapterProgress" ADD CONSTRAINT "BibleChapterProgress_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

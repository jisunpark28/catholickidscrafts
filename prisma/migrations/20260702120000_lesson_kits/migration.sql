-- CreateEnum
CREATE TYPE "LessonKitScope" AS ENUM ('GLOBAL_TEMPLATE', 'PERSONAL', 'PARISH');

-- CreateEnum
CREATE TYPE "LessonBlockType" AS ENUM ('CUSTOM_NOTE', 'RESOURCE', 'PLAY_GAME', 'TYPING_WORDS', 'HANGMAN_WORDS', 'GOSPEL_TYPING', 'BIBLE_CHAPTER', 'MASS_TODAY');

-- CreateEnum
CREATE TYPE "ParishRole" AS ENUM ('DRE', 'CATECHIST');

-- CreateTable
CREATE TABLE "Parish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParishMember" (
    "id" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "role" "ParishRole" NOT NULL DEFAULT 'CATECHIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParishMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonKit" (
    "id" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "scope" "LessonKitScope" NOT NULL DEFAULT 'PERSONAL',
    "sourceKitId" TEXT,
    "familyAccountId" TEXT,
    "parishId" TEXT,
    "liturgicalPeriod" TEXT,
    "gradeBand" TEXT,
    "familyMode" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonBlock" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "type" "LessonBlockType" NOT NULL,
    "label" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonKitOpen" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "opens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonKitOpen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parish_slug_key" ON "Parish"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Parish_inviteCode_key" ON "Parish"("inviteCode");

-- CreateIndex
CREATE INDEX "ParishMember_familyAccountId_idx" ON "ParishMember"("familyAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ParishMember_parishId_familyAccountId_key" ON "ParishMember"("parishId", "familyAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonKit_shareSlug_key" ON "LessonKit"("shareSlug");

-- CreateIndex
CREATE INDEX "LessonKit_scope_published_sortOrder_idx" ON "LessonKit"("scope", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "LessonKit_familyAccountId_idx" ON "LessonKit"("familyAccountId");

-- CreateIndex
CREATE INDEX "LessonKit_parishId_idx" ON "LessonKit"("parishId");

-- CreateIndex
CREATE INDEX "LessonBlock_kitId_sortOrder_idx" ON "LessonBlock"("kitId", "sortOrder");

-- CreateIndex
CREATE INDEX "LessonKitOpen_dateKey_idx" ON "LessonKitOpen"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "LessonKitOpen_kitId_dateKey_key" ON "LessonKitOpen"("kitId", "dateKey");

-- AddForeignKey
ALTER TABLE "ParishMember" ADD CONSTRAINT "ParishMember_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishMember" ADD CONSTRAINT "ParishMember_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKit" ADD CONSTRAINT "LessonKit_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKit" ADD CONSTRAINT "LessonKit_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKitOpen" ADD CONSTRAINT "LessonKitOpen_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "LessonKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Mom's Bible Phase 1 (PR-1). Additive: new enums/tables, new SubProfile columns, back-fills.
-- CKC Access ID columns are untouched here (they become optional in the PR-2 migration).
-- Generated with `prisma migrate diff --from-schema-datamodel` (offline) + hand-written back-fills.
-- See docs/moms-bible-migration-runbook.md before running.
-- Wrapped in one transaction so a failure leaves the database unchanged.

BEGIN;

-- CreateEnum
CREATE TYPE "MbColor" AS ENUM ('YELLOW', 'GREEN', 'BLUE', 'PINK');

-- CreateEnum
CREATE TYPE "MbAuthorKind" AS ENUM ('PARENT', 'CHILD');

-- CreateEnum
CREATE TYPE "MbItemKind" AS ENUM ('TEXT', 'STICKER');

-- CreateEnum
CREATE TYPE "MbEmailMode" AS ENUM ('INSTANT', 'DIGEST', 'OFF');

-- AlterTable
ALTER TABLE "SubProfile" ADD COLUMN     "kidCode" TEXT,
ADD COLUMN     "pinDisabledAt" TIMESTAMP(3),
ADD COLUMN     "pinFailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinHash" TEXT,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3),
ADD COLUMN     "pinSetAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ParentChildLink" (
    "id" TEXT NOT NULL,
    "parentAccountId" TEXT NOT NULL,
    "subProfileId" TEXT NOT NULL,
    "roleLabel" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentInvite" (
    "id" TEXT NOT NULL,
    "ownerAccountId" TEXT NOT NULL,
    "subProfileIds" TEXT[],
    "roleLabel" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbHighlight" (
    "id" TEXT NOT NULL,
    "subProfileId" TEXT NOT NULL,
    "authorParentId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "color" "MbColor",
    "star" BOOLEAN NOT NULL DEFAULT false,
    "underline" BOOLEAN NOT NULL DEFAULT false,
    "situationKey" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbNote" (
    "id" TEXT NOT NULL,
    "subProfileId" TEXT NOT NULL,
    "authorParentId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "startVerse" INTEGER,
    "endVerse" INTEGER,
    "color" "MbColor",
    "situationKey" TEXT,
    "batchId" TEXT,
    "importedFromMemoId" TEXT,
    "childRepliedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbNoteItem" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "authorKind" "MbAuthorKind" NOT NULL,
    "authorParentId" TEXT,
    "authorChildId" TEXT,
    "kind" "MbItemKind" NOT NULL,
    "body" TEXT,
    "stickerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MbNoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbChapterSeen" (
    "subProfileId" TEXT NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbChapterSeen_pkey" PRIMARY KEY ("subProfileId","bookSlug","chapter")
);

-- CreateTable
CREATE TABLE "MbNotification" (
    "id" TEXT NOT NULL,
    "parentAccountId" TEXT NOT NULL,
    "subProfileId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),

    CONSTRAINT "MbNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MbParentSettings" (
    "parentAccountId" TEXT NOT NULL,
    "emailMode" "MbEmailMode" NOT NULL DEFAULT 'INSTANT',
    "lastReplyEmailAt" TIMESTAMP(3),
    "unsubscribeToken" TEXT NOT NULL,
    "memoImportPromptAt" TIMESTAMP(3),
    "memoImportDoneAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbParentSettings_pkey" PRIMARY KEY ("parentAccountId")
);

-- CreateTable
CREATE TABLE "MbBook" (
    "subProfileId" TEXT NOT NULL,
    "dedication" TEXT,
    "dedicationBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbBook_pkey" PRIMARY KEY ("subProfileId")
);

-- CreateIndex
CREATE INDEX "ParentChildLink_subProfileId_idx" ON "ParentChildLink"("subProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildLink_parentAccountId_subProfileId_key" ON "ParentChildLink"("parentAccountId", "subProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentInvite_tokenHash_key" ON "ParentInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentInvite_ownerAccountId_idx" ON "ParentInvite"("ownerAccountId");

-- CreateIndex
CREATE INDEX "MbHighlight_subProfileId_bookSlug_chapter_idx" ON "MbHighlight"("subProfileId", "bookSlug", "chapter");

-- CreateIndex
CREATE INDEX "MbHighlight_batchId_idx" ON "MbHighlight"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "MbHighlight_subProfileId_authorParentId_bookSlug_chapter_ve_key" ON "MbHighlight"("subProfileId", "authorParentId", "bookSlug", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "MbNote_importedFromMemoId_key" ON "MbNote"("importedFromMemoId");

-- CreateIndex
CREATE INDEX "MbNote_subProfileId_bookSlug_chapter_idx" ON "MbNote"("subProfileId", "bookSlug", "chapter");

-- CreateIndex
CREATE INDEX "MbNote_subProfileId_lastActivityAt_idx" ON "MbNote"("subProfileId", "lastActivityAt");

-- CreateIndex
CREATE INDEX "MbNote_authorParentId_createdAt_idx" ON "MbNote"("authorParentId", "createdAt");

-- CreateIndex
CREATE INDEX "MbNote_batchId_idx" ON "MbNote"("batchId");

-- CreateIndex
CREATE INDEX "MbNoteItem_noteId_createdAt_idx" ON "MbNoteItem"("noteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MbNotification_itemId_key" ON "MbNotification"("itemId");

-- CreateIndex
CREATE INDEX "MbNotification_parentAccountId_seenAt_idx" ON "MbNotification"("parentAccountId", "seenAt");

-- CreateIndex
CREATE INDEX "MbNotification_parentAccountId_emailedAt_idx" ON "MbNotification"("parentAccountId", "emailedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MbParentSettings_unsubscribeToken_key" ON "MbParentSettings"("unsubscribeToken");

-- Backfill Kid Codes for existing children: "<name letters, max 12>-<4 random digits>"
-- Common accents are folded first ("Zoé" -> "zoe"), matching src/lib/kids/kid-code.ts.
-- (e.g. "lily-8492"; "kid-0731" when the name has fewer than 2 ASCII letters). Unique, retried on collision.
DO $$
DECLARE
  r RECORD;
  base TEXT;
  candidate TEXT;
  tries INT;
BEGIN
  FOR r IN SELECT "id", "displayName" FROM "SubProfile" WHERE "kidCode" IS NULL ORDER BY "createdAt", "id" LOOP
    base := left(lower(regexp_replace(translate(coalesce(r."displayName", ''), 'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝýÿ', 'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOOooooooUUUUuuuuYyy'), '[^A-Za-z]', '', 'g')), 12);
    IF length(base) < 2 THEN
      base := 'kid';
    END IF;
    tries := 0;
    LOOP
      candidate := base || '-' || lpad(floor(random() * 10000)::int::text, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "SubProfile" WHERE "kidCode" = candidate);
      tries := tries + 1;
      IF tries > 500 THEN
        RAISE EXCEPTION 'kidCode backfill: no free code for SubProfile %', r."id";
      END IF;
    END LOOP;
    UPDATE "SubProfile" SET "kidCode" = candidate WHERE "id" = r."id";
  END LOOP;
END $$;

ALTER TABLE "SubProfile" ALTER COLUMN "kidCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubProfile_kidCode_key" ON "SubProfile"("kidCode");

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentInvite" ADD CONSTRAINT "ParentInvite_ownerAccountId_fkey" FOREIGN KEY ("ownerAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbHighlight" ADD CONSTRAINT "MbHighlight_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbHighlight" ADD CONSTRAINT "MbHighlight_authorParentId_fkey" FOREIGN KEY ("authorParentId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNote" ADD CONSTRAINT "MbNote_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNote" ADD CONSTRAINT "MbNote_authorParentId_fkey" FOREIGN KEY ("authorParentId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNoteItem" ADD CONSTRAINT "MbNoteItem_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "MbNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNoteItem" ADD CONSTRAINT "MbNoteItem_authorParentId_fkey" FOREIGN KEY ("authorParentId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNoteItem" ADD CONSTRAINT "MbNoteItem_authorChildId_fkey" FOREIGN KEY ("authorChildId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbChapterSeen" ADD CONSTRAINT "MbChapterSeen_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNotification" ADD CONSTRAINT "MbNotification_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNotification" ADD CONSTRAINT "MbNotification_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNotification" ADD CONSTRAINT "MbNotification_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "MbNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbNotification" ADD CONSTRAINT "MbNotification_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MbNoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbParentSettings" ADD CONSTRAINT "MbParentSettings_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MbBook" ADD CONSTRAINT "MbBook_subProfileId_fkey" FOREIGN KEY ("subProfileId") REFERENCES "SubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One chapter letter (startVerse IS NULL) per child x parent x chapter (not expressible in Prisma).
CREATE UNIQUE INDEX "MbNote_chapter_letter_key" ON "MbNote"("subProfileId", "authorParentId", "bookSlug", "chapter") WHERE "startVerse" IS NULL;

-- Owner links: every existing child is linked to the family account that owns it.
INSERT INTO "ParentChildLink" ("id", "parentAccountId", "subProfileId", "roleLabel", "isOwner", "createdAt")
SELECT 'pcl_' || replace(gen_random_uuid()::text, '-', ''), s."familyAccountId", s."id", 'Parent', true, CURRENT_TIMESTAMP
FROM "SubProfile" s
ON CONFLICT ("parentAccountId", "subProfileId") DO NOTHING;

-- Default Mom's Bible settings per parent (reply emails INSTANT, random unsubscribe token).
INSERT INTO "MbParentSettings" ("parentAccountId", "emailMode", "unsubscribeToken", "updatedAt")
SELECT f."id", 'INSTANT', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), CURRENT_TIMESTAMP
FROM "FamilyAccount" f
ON CONFLICT ("parentAccountId") DO NOTHING;

COMMIT;

-- Phase 0 account security (additive).

-- 1) Revocable parent sessions ("sign out of all devices").
ALTER TABLE "FamilyAccount" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- 2) DB-backed sign-in rate limits (admin, parent Google, child Access ID).
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "AuthRateLimit_updatedAt_idx" ON "AuthRateLimit"("updatedAt");

-- 3) Stop keeping child Access IDs in plaintext (login uses the hash only).
--    Column kept for now; drop in a later migration.
UPDATE "SubProfile" SET "accessCodeDisplay" = NULL WHERE "accessCodeDisplay" IS NOT NULL;

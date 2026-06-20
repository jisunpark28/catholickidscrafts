-- Family accounts: optional password (Google-only) and Google subject id.
ALTER TABLE "FamilyAccount" ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "FamilyAccount" ADD COLUMN "googleId" TEXT;

CREATE UNIQUE INDEX "FamilyAccount_googleId_key" ON "FamilyAccount"("googleId");

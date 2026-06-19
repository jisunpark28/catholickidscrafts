-- SubProfile: deterministic lookup for Access ID login (sha256 of normalized code).
ALTER TABLE "SubProfile" ADD COLUMN "accessCodeLookup" TEXT;

-- Backfill not needed on empty deploys; existing rows without lookup cannot sign in until regenerated.

CREATE UNIQUE INDEX "SubProfile_accessCodeLookup_key" ON "SubProfile"("accessCodeLookup");

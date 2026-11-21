-- schema.prisma requires SubProfile.accessCodeLookup. The June migration added it
-- as nullable, and rows without a lookup already cannot sign in.
UPDATE "SubProfile"
SET "accessCodeLookup" = 'missing-' || "id"
WHERE "accessCodeLookup" IS NULL;

ALTER TABLE "SubProfile" ALTER COLUMN "accessCodeLookup" SET NOT NULL;

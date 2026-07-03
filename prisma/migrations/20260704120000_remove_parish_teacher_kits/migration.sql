-- Remove parish workspace; teacher-owned lesson kits only.

UPDATE "LessonKit" SET "scope" = 'PERSONAL' WHERE "scope" = 'PARISH';

DROP TABLE IF EXISTS "ParishPlan";

-- Drop LessonKit → Parish FK before dropping Parish table.
ALTER TABLE "LessonKit" DROP CONSTRAINT IF EXISTS "LessonKit_parishId_fkey";
DROP INDEX IF EXISTS "LessonKit_parishId_idx";
ALTER TABLE "LessonKit" DROP COLUMN IF EXISTS "parishId";

DROP TABLE IF EXISTS "ParishMember";
DROP TABLE IF EXISTS "Parish";

ALTER TABLE "LessonKit" ADD COLUMN IF NOT EXISTS "tptUrl" TEXT;
ALTER TABLE "LessonKit" ADD COLUMN IF NOT EXISTS "isFreeSample" BOOLEAN NOT NULL DEFAULT true;

DROP TYPE IF EXISTS "ParishRole";

ALTER TABLE "LessonKit" ALTER COLUMN "scope" DROP DEFAULT;
ALTER TYPE "LessonKitScope" RENAME TO "LessonKitScope_old";
CREATE TYPE "LessonKitScope" AS ENUM ('GLOBAL_TEMPLATE', 'PERSONAL');
ALTER TABLE "LessonKit"
  ALTER COLUMN "scope" TYPE "LessonKitScope"
  USING ("scope"::text::"LessonKitScope");
ALTER TABLE "LessonKit" ALTER COLUMN "scope" SET DEFAULT 'PERSONAL'::"LessonKitScope";
DROP TYPE "LessonKitScope_old";

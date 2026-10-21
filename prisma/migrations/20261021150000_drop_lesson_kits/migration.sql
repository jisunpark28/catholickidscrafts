-- Remove the lesson kit feature (/program, /lesson). Data backed up before this migration.

-- FamilyAccount "My Sunday" pin
ALTER TABLE "FamilyAccount" DROP CONSTRAINT IF EXISTS "FamilyAccount_sundayLessonKitId_fkey";
ALTER TABLE "FamilyAccount" DROP COLUMN IF EXISTS "sundayLessonKitId";
ALTER TABLE "FamilyAccount" DROP COLUMN IF EXISTS "sundayWeekStart";

-- Lesson kit tables (children first)
DROP TABLE IF EXISTS "LessonKitProgress";
DROP TABLE IF EXISTS "LessonAssignment";
DROP TABLE IF EXISTS "LessonKitOpen";
DROP TABLE IF EXISTS "LessonBlock";
DROP TABLE IF EXISTS "LessonKit";

-- Enums
DROP TYPE IF EXISTS "LessonBlockType";
DROP TYPE IF EXISTS "LessonKitScope";

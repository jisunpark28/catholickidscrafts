-- Teacher "My Sunday" pin on /program (which kit to run this week).

ALTER TABLE "FamilyAccount" ADD COLUMN "sundayLessonKitId" TEXT;
ALTER TABLE "FamilyAccount" ADD COLUMN "sundayWeekStart" TEXT;

ALTER TABLE "FamilyAccount" ADD CONSTRAINT "FamilyAccount_sundayLessonKitId_fkey"
  FOREIGN KEY ("sundayLessonKitId") REFERENCES "LessonKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

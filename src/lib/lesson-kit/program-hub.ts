import { listGlobalTemplates, listPersonalKits } from "@/lib/lesson-kit/db";
import { getTeacherSundayPin, type SundayPinDto } from "@/lib/lesson-kit/sunday-pin";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

export type ProgramHubData = {
  templates: LessonKitDto[];
  personal: LessonKitDto[];
  signedIn: boolean;
  sundayPin: SundayPinDto | null;
};

export async function loadProgramHubData(
  familyAccountId: string | null,
): Promise<ProgramHubData> {
  const templates = await listGlobalTemplates();

  if (!familyAccountId) {
    return { templates, personal: [], signedIn: false, sundayPin: null };
  }

  const [personal, sundayPin] = await Promise.all([
    listPersonalKits(familyAccountId),
    getTeacherSundayPin(familyAccountId),
  ]);
  return { templates, personal, signedIn: true, sundayPin };
}

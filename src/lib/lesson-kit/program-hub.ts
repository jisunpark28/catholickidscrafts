import { listGlobalTemplates, listPersonalKits } from "@/lib/lesson-kit/db";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

export type ProgramHubData = {
  templates: LessonKitDto[];
  personal: LessonKitDto[];
  signedIn: boolean;
};

export async function loadProgramHubData(
  familyAccountId: string | null,
): Promise<ProgramHubData> {
  const templates = await listGlobalTemplates();

  if (!familyAccountId) {
    return { templates, personal: [], signedIn: false };
  }

  const personal = await listPersonalKits(familyAccountId);
  return { templates, personal, signedIn: true };
}

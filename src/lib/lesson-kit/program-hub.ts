import {
  getParishMembership,
  listGlobalTemplates,
  listParishKits,
  listPersonalKits,
} from "@/lib/lesson-kit/db";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

export type ProgramHubData = {
  templates: LessonKitDto[];
  personal: LessonKitDto[];
  parish: LessonKitDto[];
  signedIn: boolean;
  parishInfo: { name: string; role: string; parishId: string } | null;
};

export async function loadProgramHubData(
  familyAccountId: string | null,
): Promise<ProgramHubData> {
  const templates = await listGlobalTemplates();

  if (!familyAccountId) {
    return {
      templates,
      personal: [],
      parish: [],
      signedIn: false,
      parishInfo: null,
    };
  }

  const [personal, membership] = await Promise.all([
    listPersonalKits(familyAccountId),
    getParishMembership(familyAccountId),
  ]);

  const parish = membership ? await listParishKits(membership.parishId) : [];

  return {
    templates,
    personal,
    parish,
    signedIn: true,
    parishInfo: membership
      ? { name: membership.parish.name, role: membership.role, parishId: membership.parishId }
      : null,
  };
}

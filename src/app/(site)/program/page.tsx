import { ProgramHub } from "@/components/lesson/ProgramHub";
import { LessonKitNav, teacherProgramNavItems } from "@/components/lesson/LessonKitNav";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { requireFamilySession } from "@/lib/family-auth";
import {
  LESSON_KIT_PRODUCT_NAME_PLURAL,
  LESSON_KIT_TAGLINE,
} from "@/lib/lesson-kit/branding";
import { loadProgramHubData } from "@/lib/lesson-kit/program-hub";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/lesson-kit.css";

export const metadata: Metadata = {
  title: LESSON_KIT_PRODUCT_NAME_PLURAL,
  description: LESSON_KIT_TAGLINE,
  ...canonicalForPath("/program"),
};

export default async function ProgramPage() {
  const session = await requireFamilySession();
  const initialData = await loadProgramHubData(session?.familyAccountId ?? null);

  return (
    <PageShell>
      <LessonKitNav items={teacherProgramNavItems()} className="mb-6" />
      <PageHeader
        title={LESSON_KIT_PRODUCT_NAME_PLURAL}
        subtitle={LESSON_KIT_TAGLINE}
      />
      <ProgramHub initialData={initialData} />
    </PageShell>
  );
}

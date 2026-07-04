import { CommunityLessonGrid } from "@/components/lesson/CommunityLessonGrid";
import { LessonKitNav, teacherCommunityNavItems } from "@/components/lesson/LessonKitNav";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { listCommunityLessonKits } from "@/lib/lesson-kit/community";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/lesson-kit.css";

export const metadata: Metadata = {
  title: "Teacher community lessons",
  description: "Lesson plans shared by Catholic classroom teachers.",
  ...canonicalForPath("/program/community"),
};

export default async function ProgramCommunityPage() {
  const [kits, session] = await Promise.all([listCommunityLessonKits(), getFamilySession()]);

  return (
    <PageShell>
      <LessonKitNav items={teacherCommunityNavItems()} className="mb-6" />
      <PageHeader
        title="Teacher community"
        subtitle="Real lesson plans from other catechists — run in class or copy and adapt."
      />
      <CommunityLessonGrid initialKits={kits} signedIn={Boolean(session)} />
    </PageShell>
  );
}

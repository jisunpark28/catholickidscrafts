import { CommunityLessonDetail } from "@/components/lesson/CommunityLessonDetail";
import { LessonKitNav, teacherCommunityDetailNavItems } from "@/components/lesson/LessonKitNav";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { getCommunityLessonKitByShareSlug } from "@/lib/lesson-kit/community";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/lesson-kit.css";

type Props = { params: Promise<{ shareSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareSlug } = await params;
  const kit = await getCommunityLessonKitByShareSlug(shareSlug);
  if (!kit) {
    return { title: "Lesson not found" };
  }
  return {
    title: kit.title,
    description: kit.description || `Teacher-shared lesson plan · ${kit.stepCount} steps`,
    ...canonicalForPath(`/program/community/${shareSlug}`),
  };
}

export default async function ProgramCommunityDetailPage({ params }: Props) {
  const { shareSlug } = await params;
  const [kit, session] = await Promise.all([
    getCommunityLessonKitByShareSlug(shareSlug),
    getFamilySession(),
  ]);

  if (!kit) {
    notFound();
  }

  return (
    <PageShell>
      <LessonKitNav
        items={teacherCommunityDetailNavItems(kit.title)}
        className="mb-6"
      />
      <CommunityLessonDetail kit={kit} signedIn={Boolean(session)} />
    </PageShell>
  );
}

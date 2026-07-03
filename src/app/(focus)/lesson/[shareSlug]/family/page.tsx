import { LessonRunHeader } from "@/components/lesson/LessonRunHeader";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { getLessonKitByShareSlug } from "@/lib/lesson-kit/db";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ shareSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareSlug } = await params;
  const kit = await getLessonKitByShareSlug(shareSlug);
  return {
    title: kit ? `${kit.title} — At home` : "Lesson at home",
    ...canonicalForPath(`/lesson/${shareSlug}/family`),
  };
}

export default async function LessonFamilyPage({ params }: Props) {
  const { shareSlug } = await params;
  const kit = await getLessonKitByShareSlug(shareSlug);
  if (!kit) notFound();

  return (
    <>
      <LessonRunHeader title={kit.title} subtitle="At home" />
      <LessonRunner kit={kit} mode="family" />
    </>
  );
}

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
      <header className="border-b border-[#e8e0d6] bg-[#fffaf5] px-4 py-3 text-center">
        <p className="text-sm font-bold text-[var(--color-ink)]">{kit.title}</p>
        <p className="text-xs text-[var(--color-muted)]">At home</p>
      </header>
      <LessonRunner kit={kit} mode="family" />
    </>
  );
}

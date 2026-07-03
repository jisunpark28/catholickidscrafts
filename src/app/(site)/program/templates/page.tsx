import { listGlobalTemplates } from "@/lib/lesson-kit/db";
import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lesson templates",
  ...canonicalForPath("/program/templates"),
};

export default async function ProgramTemplatesPage() {
  const templates = await listGlobalTemplates();

  return (
    <PageShell>
      <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
        ← Class lessons
      </Link>
      <div className="mt-6">
        <PageHeader title="Templates" subtitle="Ready-made kits from Catholic Kids Crafts." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((kit) => (
          <LessonKitCard
            key={kit.id}
            title={kit.title}
            description={kit.description}
            stepCount={kit.stepCount}
            estMinutes={kit.estMinutes}
            runHref={`/lesson/${kit.shareSlug}`}
          />
        ))}
      </div>
    </PageShell>
  );
}

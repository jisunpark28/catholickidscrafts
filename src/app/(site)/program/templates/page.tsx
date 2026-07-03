import { listGlobalTemplates } from "@/lib/lesson-kit/db";
import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import { LessonKitNav, teacherTemplatesNavItems } from "@/components/lesson/LessonKitNav";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson templates",
  ...canonicalForPath("/program/templates"),
};

export default async function ProgramTemplatesPage() {
  const templates = await listGlobalTemplates();

  return (
    <PageShell>
      <LessonKitNav items={teacherTemplatesNavItems()} className="mb-6" />
      <PageHeader title="Templates" subtitle="Ready-made kits from Catholic Kids Crafts." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

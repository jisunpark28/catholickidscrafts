import { ProgramHub } from "@/components/lesson/ProgramHub";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { requireFamilySession } from "@/lib/family-auth";
import { loadProgramHubData } from "@/lib/lesson-kit/program-hub";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/lesson-kit.css";

export const metadata: Metadata = {
  title: "Class lessons",
  description: "Run ready-made catechist lesson kits—games, Gospel typing, and crafts in one link.",
  ...canonicalForPath("/program"),
};

export default async function ProgramPage() {
  const session = await requireFamilySession();
  const initialData = await loadProgramHubData(session?.familyAccountId ?? null);

  return (
    <PageShell>
      <PageHeader
        title="Class lessons"
        subtitle="One link for your classroom. Copy a template, edit steps, run."
      />
      <ProgramHub initialData={initialData} />
    </PageShell>
  );
}

import { ProgramHub } from "@/components/lesson/ProgramHub";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/lesson-kit.css";

export const metadata: Metadata = {
  title: "Class lessons",
  description: "Run ready-made catechist lesson kits—games, Gospel typing, and crafts in one link.",
  ...canonicalForPath("/program"),
};

export default function ProgramPage() {
  return (
    <PageShell>
      <PageHeader
        title="Class lessons"
        subtitle="One link for your classroom. Copy a template, edit steps, run."
      />
      <ProgramHub />
    </PageShell>
  );
}

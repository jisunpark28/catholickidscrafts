import { MassParticipationPreview } from "@/components/mass/MassParticipationPreview";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/mass-participation.css";

export const metadata: Metadata = {
  title: "Mass — Practice responses",
  description:
    "Practice Sunday Mass responses with speaker icons for priest and children. Hide and reveal assembly parts to memorize.",
  ...canonicalForPath("/mass/participation"),
};

export default function MassParticipationPage() {
  return (
    <PageShell wide>
      <PageHeader title="Mass" />

      <MassParticipationPreview />
    </PageShell>
  );
}

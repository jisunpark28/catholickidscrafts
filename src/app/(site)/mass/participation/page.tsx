import { MassParticipationPreview } from "@/components/mass/MassParticipationPreview";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/mass-participation.css";

export const metadata: Metadata = pageMetadata({
  title: "Mass Responses for Kids",
  description:
    "Follow the whole Order of Mass part by part: what the priest says, what we answer, and when to stand or kneel. Practice mode helps kids learn responses.",
  path: "/mass/participation",
});

export default function MassParticipationPage() {
  return (
    <PageShell wide>
      <PageHeader title="Mass" />

      <MassParticipationPreview />
    </PageShell>
  );
}

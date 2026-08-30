import { MassParticipationPreview } from "@/components/mass/MassParticipationPreview";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/mass-participation.css";

export const metadata: Metadata = {
  title: "Mass — Practice responses (Preview)",
  description:
    "Practice Sunday Mass responses with cute speaker icons for priest and children. Hide and reveal assembly parts to memorize.",
  ...canonicalForPath("/mass/participation"),
};

export default function MassParticipationPage() {
  return (
    <PageShell wide>
      <PageHeader
        title="Mass"
        subtitle="Practice what children and the assembly say at Mass — with our own little priest and children icons instead of liturgical symbols."
        programNote="Use Practice mode to hide responses, then tap Show response to check your memory. Switch season to see Gloria omitted in Advent and Lent."
      >
        <span className="mass-participation__preview-badge">Preview</span>
      </PageHeader>

      <MassParticipationPreview />

      <p className="mt-8 text-sm text-[var(--color-muted)]">
        <Link href="/prayers" className="font-semibold text-[var(--color-link)]">
          ← Prayers
        </Link>
        {" · "}
        <Link href="/mass" className="font-semibold text-[var(--color-link)]">
          Daily Mass calendar
        </Link>
        {" · "}
        <Link href="/play/tiny-priest" className="font-semibold text-[var(--color-link)]">
          Tiny Priest — Mass order game
        </Link>
      </p>
    </PageShell>
  );
}

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { LiturgicalVestmentsGame } from "@/components/LiturgicalVestmentsGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liturgical Vestments Game",
  description:
    "Dress Father in the right liturgical color for each season—using the Tiny Priest character.",
};

export default function LiturgicalVestmentsPage() {
  return (
    <PageShell wide>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>

      <div className="mt-6">
        <PageHeader
          title="Liturgical vestments"
          subtitle="Match Father’s vestments to the season—then point to the real altar cloth in church."
          programNote="Try this the week you teach Advent, Lent, or a feast. Ask: “What color should we see at Mass this Sunday?”"
        />
      </div>

      <LiturgicalVestmentsGame />
    </PageShell>
  );
}

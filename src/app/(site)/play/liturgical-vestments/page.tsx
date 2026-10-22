import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { LiturgicalVestmentsGame } from "@/components/LiturgicalVestmentsGame";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Liturgical Colors Game for Kids",
  description:
    "What color does Father wear today? Kids pick the right vestment color for Advent, Lent, Easter, feasts and Ordinary Time in this 12-round quiz game.",
  path: "/play/liturgical-vestments",
});

export default async function LiturgicalVestmentsPage() {
  const copy = await getSiteCopyMap();

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
          title={copyText(copy, "play.vestments.page.title", "Liturgical vestments")}
          subtitle={copyText(copy, "play.vestments.page.subtitle", "")}
          programNote={copyText(copy, "play.vestments.page.program_note", "")}
        />
      </div>

      <LiturgicalVestmentsGame />
    </PageShell>
  );
}

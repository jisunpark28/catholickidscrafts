import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { LiturgicalVestmentsGame } from "@/components/LiturgicalVestmentsGame";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, playAppNode } from "@/lib/structured-data";

const SEO_TITLE = "Liturgical Colors Game for Kids";
const SEO_DESCRIPTION =
  "What color does Father wear today? Kids pick the right vestment color for Advent, Lent, Easter, feasts and Ordinary Time in this 12-round quiz game.";

export const metadata: Metadata = pageMetadata({
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  path: "/play/liturgical-vestments",
});

export default async function LiturgicalVestmentsPage() {
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Play & Learn", path: "/play" }, { name: SEO_TITLE, path: "/play/liturgical-vestments" }]),
          playAppNode({ name: SEO_TITLE, description: SEO_DESCRIPTION, path: "/play/liturgical-vestments", kind: "game" }),
        ]}
      />
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

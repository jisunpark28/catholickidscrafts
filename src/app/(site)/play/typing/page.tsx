import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TypingGameHub } from "@/components/TypingGameHub";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, playAppNode } from "@/lib/structured-data";

const SEO_TITLE = "Church Words Typing Game";
const SEO_DESCRIPTION =
  "Type Catholic church words before they land! A free typing game for kids with easy, medium and hard levels. Plays right in the browser.";

export const metadata: Metadata = pageMetadata({
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  path: "/play/typing",
});

export default async function PlayTypingPage() {
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Play & Learn", path: "/play" }, { name: SEO_TITLE, path: "/play/typing" }]),
          playAppNode({ name: SEO_TITLE, description: SEO_DESCRIPTION, path: "/play/typing", kind: "game" }),
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
          title={copyText(copy, "play.typing.page.title", "Typing Game")}
          subtitle={copyText(copy, "play.typing.page.subtitle", "")}
          programNote={copyText(copy, "play.typing.page.program_note", "")}
        />
      </div>

      <TypingGameHub />
    </PageShell>
  );
}

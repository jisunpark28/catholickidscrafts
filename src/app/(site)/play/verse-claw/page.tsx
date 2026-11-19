import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { VerseClawGame } from "@/components/verse-claw/VerseClawGame";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, playAppNode } from "@/lib/structured-data";

const SEO_TITLE = "Verse Claw — Catholic Blessing Claw Game for Kids";
const SEO_DESCRIPTION =
  "Move a soft toy claw, catch a cute Catholic plush doll, and receive a short Douay-Rheims verse to share with your family. Free always-win faith game for kids.";

export const metadata: Metadata = pageMetadata({
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  path: "/play/verse-claw",
});

export default async function VerseClawPage() {
  const copy = await getSiteCopyMap();

  return (
    <div className="min-w-0">
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Play & Learn", path: "/play" },
            { name: "Verse Claw", path: "/play/verse-claw" },
          ]),
          playAppNode({
            name: SEO_TITLE,
            description: SEO_DESCRIPTION,
            path: "/play/verse-claw",
            kind: "game",
          }),
        ]}
      />
      <Link href="/play" className="text-sm font-semibold text-[var(--color-link)] hover:underline">
        ← Play & learn
      </Link>

      <div className="mt-6">
        <PageHeader
          title={copyText(copy, "play.verse_claw.page.title", "Verse Claw")}
          subtitle={copyText(
            copy,
            "play.verse_claw.page.subtitle",
            "Guide the claw, catch a blessing doll, and share a Catholic verse with your family.",
          )}
          programNote={copyText(copy, "play.verse_claw.page.program_note", "")}
          actions={<ShareToClassroomButton />}
        />
      </div>

      <VerseClawGame />
    </div>
  );
}

import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import { fredoka } from "@/components/liturgy/fredoka";
import { SITUATION_GROUPS } from "@/data/moms-bible/situations";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
import { SituationsBoard, type BoardGroup } from "@/components/moms-bible/SituationsBoard";
import { momsBibleToolbar } from "@/lib/moms-bible/page-data";
import { situationVerseHref } from "@/lib/moms-bible/resolve-situation-verse";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/moms-bible.css";
import "@/styles/qa-cards.css";

// Per-viewer toolbar ("For Mia ▾"). Verse text loads for the selected moment only.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Bible Verses for Kids' Big Moments",
  description:
    "Catholic Bible verses for when your child is sad, scared, angry, moving, or celebrating, ready to highlight and share with a note.",
  path: "/moms-bible/situations",
});

const SITE_BODY_FONT = {
  fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

/** "When my child is…": moments with recommended verses; each opens the reader to leave a note. */
export default async function SituationsPage() {
  const toolbar = await momsBibleToolbar().catch(() => null);
  const board: BoardGroup[] = SITUATION_GROUPS.map((group) => ({
    color: group.color,
    emoji: group.emoji,
    title: group.title,
    situations: group.situations.map((situation) => ({
      key: situation.key,
      emoji: situation.emoji,
      title: situation.title,
      note: situation.note ?? null,
      care: situation.care ?? null,
      verses: situation.refs.flatMap((ref) => {
        const href = situationVerseHref(ref, situation.key);
        return href ? [{ label: ref.label, href, text: "" }] : [];
      }),
    })),
  }));

  return (
    <TestamentPageShell>
      <SidebarPagePanel className="mb-situations">
        {toolbar && <MbToolbar data={toolbar} variant="for" />}
        {/* Same heading as /qa-cards. That title shows the site body font, so reset this page's Inter for it. */}
        <div style={SITE_BODY_FONT}>
          <h1 className={`${fredoka.variable} qa-title text-center`}>When my child is…</h1>
        </div>
        <SituationsBoard groups={board} />
      </SidebarPagePanel>
    </TestamentPageShell>
  );
}

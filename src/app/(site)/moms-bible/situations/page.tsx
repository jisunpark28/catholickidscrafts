import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { SITUATION_GROUPS } from "@/data/moms-bible/situations";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
import { SituationsBoard, type BoardGroup } from "@/components/moms-bible/SituationsBoard";
import { momsBibleToolbar } from "@/lib/moms-bible/page-data";
import { situationVerseHref } from "@/lib/moms-bible/resolve-situation-verse";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/moms-bible.css";

// Per-viewer toolbar ("For Mia ▾"). Verse text loads for the selected moment only.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Bible Verses for Kids' Big Moments",
  description:
    "Catholic Bible verses for when your child is sad, scared, angry, moving, or celebrating, ready to highlight and share with a note.",
  path: "/moms-bible/situations",
});

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
      <div className="mb-situations rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        {toolbar && <MbToolbar data={toolbar} variant="for" />}
        <h1 className="mt-2 font-[Georgia,serif] text-3xl font-bold text-[#1f2937]">When my child is…</h1>
        <p className="mb-sub mt-1">
          Tap a moment — we&apos;ll suggest verses to open and leave a note. A note you might leave is a parent&apos;s own
          wording, not the Bible verse.
        </p>
        <SituationsBoard groups={board} />
      </div>
    </TestamentPageShell>
  );
}

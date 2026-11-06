import { PageShell } from "@/components/PageShell";
import { SITUATION_GROUPS } from "@/data/moms-bible/situations";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
import { SituationsBoard, type BoardGroup } from "@/components/moms-bible/SituationsBoard";
import { momsBibleToolbar } from "@/lib/moms-bible/page-data";
import { resolveSituationVerse } from "@/lib/moms-bible/resolve-situation-verse";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import "@/styles/moms-bible.css";

// Per-viewer toolbar ("For Mia ▾"); verse texts are cached by fetchBibleChapter.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Bible Verses for Kids' Big Moments",
  description:
    "Catholic Bible verses for when your child is sad, scared, angry, moving, or celebrating, ready to highlight and share with a note.",
  path: "/moms-bible/situations",
});

/** "When my child is…": moments with recommended verses; each opens the reader to leave a note. */
export default async function SituationsPage() {
  const groups = await Promise.all(
    SITUATION_GROUPS.map(async (g) => ({
      ...g,
      situations: await Promise.all(
        g.situations.map(async (s) => ({
          ...s,
          verses: (
            await Promise.all(s.refs.map((r) => resolveSituationVerse(r, s.key)))
          ).filter((x): x is NonNullable<typeof x> => Boolean(x)),
        })),
      ),
    })),
  );

  const toolbar = await momsBibleToolbar().catch(() => null);
  const board: BoardGroup[] = groups.map((g) => ({
    color: g.color,
    emoji: g.emoji,
    title: g.title,
    situations: g.situations.map((s) => ({
      key: s.key,
      emoji: s.emoji,
      title: s.title,
      verses: s.verses.map((v) => ({ label: v.ref.label, href: v.href, text: v.text })),
    })),
  }));

  return (
    <PageShell wide>
      <div className="mb-situations rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
        {toolbar && <MbToolbar data={toolbar} variant="for" />}
        <h1 className="mt-2 font-[Georgia,serif] text-3xl font-bold text-[#1f2937]">When my child is…</h1>
        <p className="mb-sub mt-1">Tap a moment — we&apos;ll suggest verses to open and leave a note.</p>
        <SituationsBoard groups={board} />
      </div>
    </PageShell>
  );
}

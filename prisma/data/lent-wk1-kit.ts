import type { LessonBlockConfig } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";

export const LENT_WK1_SHARE_SLUG = "lent-wk1-g3";

type GlobalTemplateBlock = {
  sortOrder: number;
  type: LessonBlockType;
  label: string;
  config: LessonBlockConfig;
};

export type GlobalTemplateSeed = {
  shareSlug: string;
  title: string;
  description: string;
  liturgicalPeriod?: string;
  gradeBand?: string;
  sortOrder: number;
  tptUrl?: string | null;
  isFreeSample?: boolean;
  familyMode?: { gospelMaxChars?: number };
  blocks: GlobalTemplateBlock[];
};

/** Showcase Lent Week 1 Sunday school kit (Grade 3). */
export function lentWk1TemplateSeed(tptStoreUrl: string): GlobalTemplateSeed {
  return {
    shareSlug: LENT_WK1_SHARE_SLUG,
    title: "Lent Week 1 — Sunday (Grade 3)",
    description:
      "First Sunday of Lent: purple, prayer, Gospel, Stations craft, and a short at-home mission. Classroom ~35 min; at-home ~10 min.",
    liturgicalPeriod: "lent",
    gradeBand: "Grade 3",
    sortOrder: 0,
    tptUrl: tptStoreUrl,
    isFreeSample: true,
    familyMode: { gospelMaxChars: 150 },
    blocks: [
      {
        sortOrder: 0,
        type: "CUSTOM_NOTE",
        label: "Opening",
        config: {
          familyInclude: false,
          html: `<p><strong>Welcome (3 min)</strong></p>
<ul>
<li>Light a purple cloth or show a purple stole picture.</li>
<li>Say: <em>Lent is forty days to grow closer to Jesus through prayer, fasting, and helping others.</em></li>
<li>Ask: <em>What is one kind thing you can do for someone this week?</em></li>
</ul>`,
        },
      },
      {
        sortOrder: 1,
        type: "MASS_TODAY",
        label: "Today in the Church",
        config: {},
      },
      {
        sortOrder: 2,
        type: "GOSPEL_TYPING",
        label: "Today's Gospel",
        config: {
          readingKind: "gospel",
          maxChars: 400,
          familyInclude: true,
        },
      },
      {
        sortOrder: 3,
        type: "PLAY_GAME",
        label: "Liturgical colors — Lent",
        config: {
          gameSlug: "liturgical-vestments",
          familyInclude: false,
        },
      },
      {
        sortOrder: 4,
        type: "TYPING_WORDS",
        label: "Lent words",
        config: {
          wordPreset: "lent",
          familyInclude: false,
        },
      },
      {
        sortOrder: 5,
        type: "RESOURCE",
        label: "Stations craft",
        config: {
          resourceSlug: "lent-stations-cross-craft",
          familyInclude: false,
        },
      },
      {
        sortOrder: 6,
        type: "CUSTOM_NOTE",
        label: "Closing",
        config: {
          familyInclude: false,
          html: `<p><strong>Close (2 min)</strong></p>
<p>Invite a child to lead: <em>Jesus, help us pray more and love more this Lent. Amen.</em></p>
<p>Point parents to the <strong>at-home link</strong> for this week&apos;s short mission.</p>`,
        },
      },
      {
        sortOrder: 7,
        type: "CUSTOM_NOTE",
        label: "Classroom worksheet (TPT)",
        config: {
          familyInclude: false,
          html: `<p><a href="${tptStoreUrl}" target="_blank" rel="noopener noreferrer">Open full Lent Week 1 pack on TPT (PDF)</a></p>`,
        },
      },
      {
        sortOrder: 8,
        type: "CUSTOM_NOTE",
        label: "At-home mission",
        config: {
          familyInclude: true,
          html: `<p><strong>This week at home (~10 min)</strong></p>
<ol>
<li>At dinner, share one Lent promise (what we will give up or do extra for Jesus).</li>
<li>Finish the Gospel step on this page.</li>
<li>Pray together: <em>Jesus, help our family during Lent. Amen.</em></li>
</ol>`,
        },
      },
    ],
  };
}

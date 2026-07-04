import type { LessonBlockConfig } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";

export const MASS_ETIQUETTE_LOWER_SLUG = "mass-etiquette-lower";

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

/**
 * Lower-elementary Mass etiquette (based on catechist lesson plan: entering church,
 * Sign of the Cross, responses, kneeling, Communion line / blessing).
 */
export function massEtiquetteLowerTemplateSeed(tptStoreUrl: string): GlobalTemplateSeed {
  return {
    shareSlug: MASS_ETIQUETTE_LOWER_SLUG,
    title: "Mass Etiquette — Lower Elementary",
    description:
      "Help K–2 children participate at Mass with reverence: why we worship, entering the church, Sign of the Cross, responses, kneeling, and the Communion line. Classroom ~40 min; at-home ~10 min.",
    liturgicalPeriod: "ordinary",
    gradeBand: "Grades K–2",
    sortOrder: 4,
    tptUrl: tptStoreUrl,
    isFreeSample: true,
    blocks: [
      {
        sortOrder: 0,
        type: "CUSTOM_NOTE",
        label: "Opening",
        config: {
          familyInclude: false,
          html: `<p><strong>Welcome &amp; goal (5 min)</strong></p>
<p><strong>Learning goal:</strong> Children understand basic Mass etiquette so they can join worship with a reverent attitude.</p>
<ul>
<li>Pray the <strong>Our Father</strong> together.</li>
<li>Ask: <em>What rules do we follow when we go to Mass?</em> (Listen; write ideas on the board.)</li>
</ul>`,
        },
      },
      {
        sortOrder: 1,
        type: "CUSTOM_NOTE",
        label: "Why we celebrate Mass",
        config: {
          familyInclude: false,
          html: `<p><strong>Why we go to Mass (5 min)</strong></p>
<ul>
<li>At Mass we remember Jesus&apos;s sacrifice and love.</li>
<li>At the <strong>Last Supper</strong>, Jesus said: <em>&ldquo;Do this in memory of me.&rdquo;</em></li>
<li>We do not come only to watch—we come to <strong>pray and offer ourselves</strong> with Jesus.</li>
</ul>`,
        },
      },
      {
        sortOrder: 2,
        type: "CUSTOM_NOTE",
        label: "Before Mass starts",
        config: {
          familyInclude: false,
          html: `<p><strong>Entering church (5 min)</strong></p>
<ul>
<li>Bless yourself with <strong>holy water</strong> and face the tabernacle or altar (bow or genuflect as your parish does).</li>
<li>Walk quietly to your pew and sit.</li>
<li>Once seated: <strong>no chatting</strong>—use a whisper only if you must.</li>
<li>Invite children to name one thing they will do better <em>before</em> Mass starts this Sunday.</li>
</ul>`,
        },
      },
      {
        sortOrder: 3,
        type: "WRITING",
        label: "Before Mass — our promise",
        config: {
          prompt:
            "Write one way you will show respect before Mass starts (for example: walk quietly, bless myself with holy water, or pray silently in the pew).",
          writingMode: "student",
          maxChars: 120,
          placeholder: "This Sunday I will…",
          familyInclude: true,
        },
      },
      {
        sortOrder: 4,
        type: "CUSTOM_NOTE",
        label: "Sign of the Cross & prayer hands",
        config: {
          familyInclude: false,
          html: `<p><strong>Practice together (5 min)</strong></p>
<ul>
<li>Practice the <strong>Sign of the Cross</strong> slowly: forehead, chest, left shoulder, right shoulder.</li>
<li>Practice <strong>prayer hands</strong> (folded hands, eyes forward or closed).</li>
<li>Invite a volunteer to demonstrate for the class. Cheer for clear, gentle movements—not speed.</li>
<li>Sing one familiar Mass hymn or response your parish uses (accompanist, recording, or a cappella).</li>
</ul>`,
        },
      },
      {
        sortOrder: 5,
        type: "LINK",
        label: "Order of Mass (reference)",
        config: {
          url: "https://www.usccb.org/prayer-and-worship/the-mass/order-of-mass",
          buttonLabel: "Open Order of Mass (USCCB)",
          openInNewTab: true,
          familyInclude: false,
        },
      },
      {
        sortOrder: 6,
        type: "CUSTOM_NOTE",
        label: "Mass responses",
        config: {
          familyInclude: false,
          html: `<p><strong>What we say at Mass (5 min)</strong></p>
<p>Practice these responses in pairs, then all together:</p>
<ul>
<li>Priest: <em>The Lord be with you.</em> — People: <em>And with your spirit.</em></li>
<li>After the readings: <em>Thanks be to God.</em></li>
<li>After the Gospel: <em>Praise to you, Lord Jesus Christ.</em></li>
</ul>
<p>At the <strong>Eucharistic Prayer</strong>, bread and wine become Jesus&apos;s Body and Blood. This is the holiest part of Mass—<strong>kneel in silence</strong> and do not talk to neighbors.</p>`,
        },
      },
      {
        sortOrder: 7,
        type: "WRITING",
        label: "Quiet at the altar",
        config: {
          prompt:
            "When is the most important time to be completely quiet at Mass? Write one sentence.",
          writingMode: "student",
          maxChars: 150,
          placeholder: "The most important quiet time is…",
          familyInclude: true,
        },
      },
      {
        sortOrder: 8,
        type: "CUSTOM_NOTE",
        label: "Kneeling & posture",
        config: {
          familyInclude: false,
          html: `<p><strong>Kneeling practice (5 min)</strong></p>
<ul>
<li>Show <strong>good kneeling posture</strong>: back straight, hands folded, eyes on the altar.</li>
<li>Briefly show a <strong>common mistake</strong> (slouching, looking around, talking)—then the correct way again.</li>
<li>Let volunteers practice at the front if space allows.</li>
</ul>`,
        },
      },
      {
        sortOrder: 9,
        type: "CUSTOM_NOTE",
        label: "Communion line",
        config: {
          familyInclude: false,
          html: `<p><strong>Communion &amp; blessing (5 min)</strong></p>
<ul>
<li>Those receiving Communion walk with hands folded, say <em>Amen</em>, and return reverently.</li>
<li>Children not yet receiving: cross arms over chest, receive a <strong>blessing</strong>, then return.</li>
<li>After Communion or a blessing: <strong>kneel and pray</strong>—no talking until everyone is finished.</li>
<li>Practice lining up in the classroom (slow walk, crossed arms for a blessing).</li>
</ul>`,
        },
      },
      {
        sortOrder: 10,
        type: "RESOURCE",
        label: "First Communion prep",
        config: {
          resourceSlug: "first-communion-examination",
          familyInclude: false,
        },
      },
      {
        sortOrder: 11,
        type: "TYPING_WORDS",
        label: "Mass words",
        config: {
          wordPreset: "communion",
          familyInclude: false,
        },
      },
      {
        sortOrder: 12,
        type: "PLAY_GAME",
        label: "Mass order (Tiny Priest)",
        config: {
          gameSlug: "church",
          familyInclude: false,
        },
      },
      {
        sortOrder: 13,
        type: "CUSTOM_NOTE",
        label: "Closing",
        config: {
          familyInclude: false,
          html: `<p><strong>Close (3 min)</strong></p>
<p>Pray a <strong>Grace Before Meals</strong> (or a simple thanksgiving prayer) and remind children to use one new habit at Mass this Sunday.</p>
<p>Share the <strong>at-home link</strong> for a short family review.</p>`,
        },
      },
      {
        sortOrder: 14,
        type: "CUSTOM_NOTE",
        label: "Classroom worksheet (TPT)",
        config: {
          familyInclude: false,
          html: `<p>Optional printable pack: <a href="${tptStoreUrl}" target="_blank" rel="noopener noreferrer">Mass etiquette worksheets on TPT</a></p>`,
        },
      },
      {
        sortOrder: 15,
        type: "CUSTOM_NOTE",
        label: "At-home mission",
        config: {
          familyInclude: true,
          html: `<p><strong>This week at home (~10 min)</strong></p>
<ol>
<li>Before Sunday Mass, name one respectful habit from today&apos;s lesson.</li>
<li>Complete the short writing prompts on this page.</li>
<li>Practice the Sign of the Cross and one Mass response together.</li>
<li>Pray: <em>Jesus, help me worship you with my whole heart at Mass. Amen.</em></li>
</ol>`,
        },
      },
    ],
  };
}

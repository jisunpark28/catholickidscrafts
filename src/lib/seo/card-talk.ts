/**
 * Family-talk text for Little Light picture cards (intro + 3 questions). Client-safe and data-free,
 * so the Cards detail panel can build it from one opened card. Saint cards use saintPageSeo.
 * Templates only quote or paraphrase the printed caption; they never add stories, legends or ages.
 */
import type { CardCategory, PictureCard } from "@/lib/resource/card-meta";
import type { CardPageSeo } from "./card-seo";

export type TalkCard = Pick<PictureCard, "id" | "cat" | "set" | "title" | "text" | "ref" | "when">;

const FAITH_CATS = new Set<CardCategory>(["Virtue & Life", "Prayer", "Sacrament", "Mass & Church"]);

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > 40 ? cut.slice(0, i) : cut).trimEnd()}…`;
}

export function faithPageSeo(card: TalkCard): CardPageSeo {
  const whenBit = card.when ? ` Often used ${card.when}.` : "";
  const refBit = card.ref ? ` Scripture cue: ${card.ref}.` : "";
  const catLabel = card.cat;
  const variants: Array<[string, string]> = [
    [
      `"${card.title}" is a ${catLabel} card in the "${card.set}" set. It teaches kids: "${card.text}"`,
      `Use it before Mass, during family prayer, or in a catechism lesson when you need one clear Catholic idea.${whenBit}${refBit}`,
    ],
    [
      `Catholic parents hunting for a plain-language take on "${card.title}" can start here. The card says: "${card.text}"`,
      `That line sits inside "${card.set}" under ${catLabel}, so it fits naturally with the rest of your faith shelf.${whenBit}${refBit}`,
    ],
    [
      `Kids remember faith when it is concrete. "${card.title}" gives them this: "${card.text}"`,
      `Read it twice — once for the words, once for a quiet pause — then try the talk prompts below.${whenBit}${refBit}`,
    ],
    [
      `From our ${catLabel} collection, "${card.title}" belongs to "${card.set}". Its kid-friendly summary: "${card.text}"`,
      `Keep the card nearby when questions about Church life bubble up at the dinner table.${whenBit}${refBit}`,
    ],
  ];
  const intro = variants[hash(card.id) % variants.length]!;
  const qVariants: Array<[string, string, string]> = [
    [
      `In your own words, what does "${card.title}" mean after hearing "${card.text}"?`,
      `Where might we practice this ${catLabel.toLowerCase()} idea at home this week?`,
      card.ref
        ? `How does ${card.ref} shine a light on "${card.title}"?`
        : `What is one question you still have about "${card.title}"?`,
    ],
    [
      `Which word in "${card.text}" feels most important to you?`,
      `How could "${card.title}" help a friend who is new to Mass or prayer?`,
      card.when
        ? `When we see this around ${card.when}, what should we remember?`
        : `Who in our parish lives "${card.title}" well?`,
    ],
    [
      `Why do Catholics care about "${card.title}" enough to put it on a kids' card?`,
      `What is a kind action that matches "${card.text}"?`,
      `Shall we thank God for teaching us through "${card.title}"?`,
    ],
  ];
  const questions = qVariants[hash(card.id + "q") % qVariants.length]!;
  return {
    seoTitle: clip(`${card.title} — Catholic Faith for Kids`, 60),
    description: clip(
      `Catholic faith card for kids: ${card.title} (${card.cat} / ${card.set}). "${card.text}"${whenBit}${refBit}`,
      158,
    ),
    h1: `${card.title}: Catholic faith explained for kids`,
    intro,
    questions,
  };
}

/** Short quote for intros and questions, so long prayers are never pasted whole. */
export function talkQuote(text: string): string {
  // Drop quote marks printed around the caption so templates do not double them.
  const t = text.replace(/\s+/g, " ").trim().replace(/^["“](.*)["”]$/, "$1");
  return t.length <= 120 ? t : clip(t, 60);
}

/** Fun cards print the answer in brackets at the end ("… Who am I? (St. Peter)"); keep it apart. */
export function splitAnswer(text: string): { clue: string; answer?: string } {
  const m = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(text.trim());
  return m ? { clue: m[1]!, answer: m[2]! } : { clue: text.trim() };
}

/** Masterpiece captions end with " — Artist, date". */
function splitArtist(text: string): { desc: string; artist?: string } {
  const i = text.lastIndexOf(" — ");
  return i > 0 ? { desc: text.slice(0, i).trim(), artist: text.slice(i + 3).trim() } : { desc: text.trim() };
}

/** Generic card page text for Bible, Feast, Mary, Liturgical Year, Fun and Masterpiece cards. */
export function cardPageSeo(card: TalkCard): CardPageSeo {
  const t = card.title;
  const refBit = card.ref ? ` Scripture on the card: ${card.ref}.` : "";
  const whenBit = card.when && card.when !== "—" ? ` When: ${card.when}.` : "";
  let intro: [string, string];
  let questions: [string, string, string];
  switch (card.cat) {
    case "Bible": {
      const q = talkQuote(card.text);
      intro = [
        `"${t}" is a Bible card from the "${card.set}" set. The card says: "${q}"`,
        card.ref
          ? `Read ${card.ref} together as a family, then talk about the questions below.`
          : "Talk about it together with the questions below.",
      ];
      questions = [
        card.ref
          ? `After reading ${card.ref} together, can you tell "${t}" in your own words?`
          : `Can you tell "${t}" in your own words?`,
        `The card says: "${q}" What does this show us about God?`,
        "How can our family remember this Bible story this week?",
      ];
      break;
    }
    case "Feast": {
      const q = talkQuote(card.text);
      intro = [
        `"${t}" is a feast card from the "${card.set}" set. The card says: "${q}"`,
        `Use it to get ready for this day at Mass and at home.${whenBit}${refBit}`,
      ];
      questions = [
        `What is the Church celebrating on "${t}"?`,
        `The card says: "${q}" What does that mean for our family?`,
        "How could we celebrate this day at home, with a prayer, a song or a kind act?",
      ];
      break;
    }
    case "Mary": {
      const q = talkQuote(card.text);
      intro = [
        `"${t}" is a Mary card from the "${card.set}" set. The card says: "${q}"`,
        `Mary always leads us to her Son, Jesus.${whenBit}${refBit}`,
      ];
      questions = [
        `What does "${q}" tell us about Mary?`,
        "How does Mary help us come closer to Jesus?",
        "What short prayer could we say to Mary together today?",
      ];
      break;
    }
    case "Liturgical Year": {
      const q = talkQuote(card.text);
      intro = [
        `"${t}" is a Church Year card from the "${card.set}" set. The card says: "${q}"`,
        `The Church's year helps us walk with Jesus through every season.${whenBit}${refBit}`,
      ];
      questions =
        card.set === "Stations of the Cross"
          ? [
              `What happens at this Station? The card says: "${q}"`,
              "How does this Station show Jesus' love for us?",
              "What short prayer could we say to Jesus at this Station?",
            ]
          : [
              `What does "${t}" help us remember?`,
              `The card says: "${q}" What could our family do to live this?`,
              "What might we see or hear at church that goes with this card?",
            ];
      break;
    }
    case "Masterpiece": {
      const { desc, artist } = splitArtist(card.text);
      const q = talkQuote(desc);
      intro = [
        `"${t}" is a sacred art card from the "${card.set}" set. The card says: "${q}"`,
        `${artist ? `Artwork: ${artist}.` : "Look closely at the picture together."}${refBit}`,
      ];
      questions = [
        "What do you notice first in this picture?",
        `The card says: "${q}" Where do you see that in the art?`,
        card.ref
          ? `After reading ${card.ref} together, how does the artist show this moment?`
          : "How could this picture help us pray?",
      ];
      break;
    }
    default: {
      // Fun & Collectible: never repeat the printed answer.
      const { clue, answer } = splitAnswer(card.text);
      const q = talkQuote(clue);
      if (card.set.startsWith("Who Am I?")) {
        intro = [
          `"${t}" is a riddle card from the "${card.set}" set. Read the clue: "${q}"`,
          "Guess first, then check the answer below.",
        ];
        questions = [
          "Who do you think the card is about, and which clue helped you most?",
          "What can we learn from this saint's life?",
          `Can you make up a "Who am I?" clue about another saint you know?`,
        ];
      } else {
        intro = [
          `"${t}" is a fun card from the "${card.set}" set. The card says: "${q}"`,
          card.ref ? `Scripture on the card: ${card.ref}.` : "It is a fun way to learn about our faith together.",
        ];
        questions = card.set.startsWith("Find It")
          ? [
              "Next time we go to church, can you find it?",
              "Why do you think it is in our church?",
              "What could we say to Jesus when we see it?",
            ]
          : card.set.startsWith("Match the Symbol")
            ? [
                "What does this symbol tell us about the saint?",
                "Can you find the matching saint card?",
                "What other saint symbols do you know?",
              ]
            : card.set === "Animals of the Bible"
              ? [
                  card.ref
                    ? `After reading ${card.ref} together, what does this animal do in the story?`
                    : "What does this animal do in the Bible story?",
                  "What does this story teach us about God?",
                  "Can you draw this animal and tell the story to someone at home?",
                ]
              : [
                  "What do you like best about this card?",
                  answer
                    ? "What is your guess? Check the answer below to see if you were right."
                    : `The card says: "${q}" How can we do this together?`,
                  "What does this card help us learn about God or our faith?",
                ];
      }
    }
  }
  return {
    seoTitle: clip(`${t} — Catholic Card for Kids`, 60),
    description: clip(`Catholic ${card.cat} card for kids: ${t} (${card.set}). "${talkQuote(card.text)}"${whenBit}${refBit}`, 158),
    h1: `${t}: a Catholic card for kids`,
    intro,
    questions,
  };
}

export type CardTalk = {
  /** Printed caption to show (Fun answers split out into `answer`). */
  caption: string;
  answer?: string;
  intro: readonly [string, string];
  questions: readonly [string, string, string];
};

/** Intro + 3 family questions for an opened non-saint card (null for Saint cards). */
export function cardTalk(card: TalkCard): CardTalk | null {
  if (card.cat === "Saint") return null;
  if (FAITH_CATS.has(card.cat)) {
    const seo = faithPageSeo({ ...card, text: talkQuote(card.text) });
    return { caption: card.text, intro: seo.intro, questions: seo.questions };
  }
  const seo = cardPageSeo(card);
  if (card.cat === "Fun & Collectible") {
    const { clue, answer } = splitAnswer(card.text);
    return { caption: clue, ...(answer ? { answer } : {}), intro: seo.intro, questions: seo.questions };
  }
  return { caption: card.text, intro: seo.intro, questions: seo.questions };
}

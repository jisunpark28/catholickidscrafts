/**
 * Family-talk text for Little Light picture cards (intro + 3 questions). Client-safe and data-free,
 * so the Cards detail panel can build it from one opened card. Saint cards use saintPageSeo.
 * Templates only quote or paraphrase the printed caption; they never add stories, legends or ages.
 */
import type { CardCategory, PictureCard } from "@/lib/resource/card-meta";
import type { CardPageSeo } from "./card-seo";

export type TalkCard = Pick<PictureCard, "id" | "cat" | "set" | "title" | "text" | "ref" | "when">;

const FAITH_CATS = new Set<CardCategory>(["Virtue & Life", "Prayer", "Sacrament", "Mass & Church"]);

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > 40 ? cut.slice(0, i) : cut).trimEnd()}…`;
}

/** Clean short card name: "The Our Father (The Lord's Prayer)" -> "The Our Father". */
export function shortCardName(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+[–-]\s+.*$/, "")
    .replace(/:\s+.*$/, "")
    .trim();
}

/** "The Our Father" -> "the Our Father" (mid-sentence). */
function midName(name: string): string {
  return name.replace(/^The\b/, "the");
}

/** "Fear of the Lord" -> "fear of the Lord". */
function lowerFirst(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** "Social Intelligence" -> "social intelligence", "Fear of the Lord" -> "fear of the Lord". */
function lowerVirtue(name: string): string {
  return name.toLowerCase().replace(/\blord\b/g, "Lord");
}

/** Natural intro + questions for Virtue, Prayer, Sacrament and Mass cards (no long quotes, no stories). */
function faithTalkText(card: TalkCard): { intro: [string, string]; questions: [string, string, string] } {
  const name = shortCardName(card.title) || card.title;
  const mid = midName(name);
  const refBit = card.ref ? ` Scripture on the card: ${card.ref}.` : "";
  const text = card.text.replace(/\s+/g, " ").trim();
  const said = text.length <= 120 ? ` The card says: "${talkQuote(text)}"` : " The full words are printed on the card.";
  const setName = card.set.replace(/\s*\([^)]*\)/g, "").replace(/^The\s+/, "");
  const lead = `${name} is a ${card.cat} card from the ${setName} set.${said}`;
  switch (card.cat) {
    case "Prayer": {
      if (card.set === "Rosary") {
        if (!/^\w+ \d+:/.test(card.title)) {
          return {
            intro: [lead, `Pray it slowly together, one bead at a time.${refBit}`],
            questions: [
              "Which part of the Rosary would you like to lead at home?",
              "Shall we count the beads of one decade together?",
              "When could our family pray one decade together this week?",
            ],
          };
        }
        const kind = card.title.split(" ")[0]!;
        const mystery = card.title.slice(card.title.indexOf(":") + 1).trim();
        return {
          intro: [
            `${mystery} is one of the ${kind} Mysteries of the Rosary.${said}`,
            `Pray one decade while thinking about this moment in the life of Jesus and Mary.${refBit}`,
          ],
          questions: [
            card.ref
              ? `After reading ${card.ref} together, can you tell what happens in this mystery in your own words?`
              : "Can you tell what happens in this mystery in your own words?",
            `What does ${midName(mystery)} teach us about God's love?`,
            "Who could we offer this decade for?",
          ],
        };
      }
      const startsWithThe = /^The\b/.test(name);
      return {
        intro: [lead, `Pray it slowly together, then talk about the questions below.${refBit}`],
        questions: [
          startsWithThe
            ? `What is one line of ${mid} you'd like to remember?`
            : "What is one line of this prayer you'd like to remember?",
          startsWithThe
            ? `When could our family pray ${mid} together: in the morning, at meals or at bedtime?`
            : "When could our family pray this prayer together: in the morning, at meals or at bedtime?",
          "Who would you like to pray for when we say this prayer?",
        ],
      };
    }
    case "Virtue & Life": {
      const intro: [string, string] = [lead, `Talk about it together, then pick one small way to live it this week.${refBit}`];
      if (card.set === "The Ten Commandments") {
        return {
          intro,
          questions: [
            `What does ${mid} ask us to do?`,
            "What is one way our family can keep this commandment this week?",
            "How does this commandment help us love God and our neighbor?",
          ],
        };
      }
      if (card.set === "The Beatitudes") {
        return {
          intro,
          questions: [
            "What do you think Jesus means in this Beatitude?",
            "Why do you think Jesus calls these people blessed?",
            "How could we live this Beatitude at home or at school?",
          ],
        };
      }
      if (card.set.endsWith("Works of Mercy")) {
        return {
          intro,
          questions: [
            `Why is "${name}" a work of mercy?`,
            "What is one small way our family could show this kind of mercy?",
            "Who in our parish or town helps people in this way?",
          ],
        };
      }
      if (card.set === "Gifts of the Holy Spirit") {
        const gift = lowerVirtue(name);
        return {
          intro,
          questions: [
            `What does the gift of ${gift} help us do?`,
            `When could you ask the Holy Spirit for the gift of ${gift}?`,
            "Where could you use this gift at home or at school this week?",
          ],
        };
      }
      if (card.set === "Fruits of the Holy Spirit") {
        return {
          intro,
          questions: [
            "Which fruits of the Holy Spirit can you name from the card?",
            "Which one would you like to grow in this week?",
            "How can we help each other grow in it?",
          ],
        };
      }
      if (card.set === "Precepts of the Church") {
        return {
          intro,
          questions: [
            `Why does the Church ask us to ${lowerFirst(name)}?`,
            "How can our family keep this precept together?",
            "What helps you remember to do this?",
          ],
        };
      }
      const virtue = lowerVirtue(name);
      return {
        intro,
        questions: [
          `What does ${virtue} look like at home?`,
          `Who do you know who shows ${virtue}?`,
          `What is one way you could practice ${virtue} this week?`,
        ],
      };
    }
    case "Sacrament": {
      const intro: [string, string] = [lead, `Sacraments are special signs where Jesus gives us his grace.${refBit}`];
      if (card.set === "The Seven Sacraments") {
        return {
          intro,
          questions:
            card.id === "SAC-001"
              ? [
                  "Can you name all seven sacraments?",
                  "Which sacraments have people in our family received?",
                  "Why do you think Jesus gives us these special signs?",
                ]
              : [
                  `In your own words, what does ${mid} do for us?`,
                  `Where have you seen ${mid} celebrated in our parish?`,
                  `How can we pray for people getting ready for ${mid}?`,
                ],
        };
      }
      return {
        intro,
        questions: [
          "What is one thing this card teaches you?",
          "How could we bring this into our family's faith life this week?",
          "What is one question you would like to ask our priest or catechist about it?",
        ],
      };
    }
    default: {
      // Mass & Church
      const intro: [string, string] = [lead, `Look for it the next time your family goes to Mass.${refBit}`];
      const questions: [string, string, string] =
        card.set === "The Church Building"
          ? [
              "Can you find this in our church next Sunday?",
              "What does it help us remember about Jesus?",
              "Why do you think the Church gives it a special place?",
            ]
          : card.set === "Sacred Vessels & Objects"
            ? [
                "Have you seen this at Mass? What is it used for?",
                "Why do you think we treat it with such care?",
                "What could you look for the next time we go to Mass?",
              ]
            : card.set === "Vestments & Ministers"
              ? [
                  "Where have you seen this at Mass?",
                  "How does it help us worship God together?",
                  "How can we pray for the people who serve at our parish?",
                ]
              : card.set === "How We Pray at Church"
                ? [
                    "When do we do this at church?",
                    "What does it say to God without words?",
                    "Can you show us how to do it?",
                  ]
                : [
                    "What do we do or say during this part of the Mass?",
                    "Next Sunday, can you listen for this part and tell us when it happens?",
                    "How can this part of the Mass help us pray with our whole heart?",
                  ];
      return { intro, questions };
    }
  }
}

export function faithPageSeo(card: TalkCard): CardPageSeo {
  const whenBit = card.when ? ` Often used ${card.when}.` : "";
  const refBit = card.ref ? ` Scripture cue: ${card.ref}.` : "";
  const { intro, questions } = faithTalkText(card);
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

export type CardFact = {
  label: string;
  value: string;
  /** Show behind a "Show answer" toggle (riddle answers). */
  hidden?: boolean;
};

export type CardTalk = {
  /** H1 for the detail panel. */
  h1: string;
  /** Printed caption to show (Fun answers and artwork credits split out). */
  caption: string;
  /** "Feast day" for dated feast and Mary cards, else "When". */
  whenLabel: string;
  /** Short Fact Box rows; never repeat the caption. */
  facts: CardFact[];
  questions: readonly [string, string, string];
};

const CAT_LABEL: Record<CardCategory, string> = {
  Feast: "Feast card",
  Prayer: "Prayer card",
  Saint: "Saint card",
  Mary: "Mary card",
  Sacrament: "Sacrament card",
  "Mass & Church": "Mass & Church card",
  "Liturgical Year": "Church Year card",
  Bible: "Bible card",
  "Virtue & Life": "Virtue card",
  "Fun & Collectible": "Fun card",
  Masterpiece: "Sacred art card",
};

/** One short, practical tip per card type (no caption, no stories). */
function cardTip(card: TalkCard): string {
  switch (card.cat) {
    case "Prayer":
      if (card.set === "Rosary") {
        return /^\w+ \d+:/.test(card.title)
          ? "Pray one decade while thinking about this moment in the life of Jesus and Mary."
          : "Pray it slowly together, one bead at a time.";
      }
      return "Pray it slowly together, then talk about the questions below.";
    case "Virtue & Life":
      return "Talk about it together, then pick one small way to live it this week.";
    case "Sacrament":
      return "Sacraments are special signs where Jesus gives us his grace.";
    case "Mass & Church":
      return "Look for it the next time your family goes to Mass.";
    case "Bible":
      return card.ref
        ? "Read the Scripture on the card together, then talk about the questions below."
        : "Talk about the story together with the questions below.";
    case "Feast":
      return "Use it to get ready for this day at Mass and at home.";
    case "Mary":
      return "Mary always leads us to her Son, Jesus.";
    case "Liturgical Year":
      return "The Church's year helps us walk with Jesus through every season.";
    case "Masterpiece":
      return "Look closely at the picture together.";
    default:
      return card.set.startsWith("Who Am I?")
        ? "Guess first, then check the answer."
        : "A fun way to learn about our faith together.";
  }
}

/** Detail panel data for an opened non-saint card (null for Saint cards). */
export function cardTalk(card: TalkCard): CardTalk | null {
  if (card.cat === "Saint") return null;
  const seo = FAITH_CATS.has(card.cat) ? faithPageSeo(card) : cardPageSeo(card);
  const facts: CardFact[] = [{ label: "Card type", value: CAT_LABEL[card.cat] }];
  let caption = card.text;
  if (card.cat === "Prayer" && card.set === "Rosary" && /^\w+ \d+:/.test(card.title)) {
    facts.push({ label: "Mystery", value: `${card.title.split(" ")[0]} Mysteries of the Rosary` });
  }
  if (card.cat === "Masterpiece") {
    const { desc, artist } = splitArtist(card.text);
    caption = desc;
    if (artist) facts.push({ label: "Artwork", value: artist });
  }
  if (card.cat === "Fun & Collectible") {
    const { clue, answer } = splitAnswer(card.text);
    caption = clue;
    if (answer) facts.push({ label: "Answer", value: answer, hidden: true });
  }
  facts.push({ label: "Try this", value: cardTip(card) });
  const dated = card.when && card.when !== "—" && /\d/.test(card.when);
  return {
    h1: seo.h1,
    caption,
    whenLabel: dated && (card.cat === "Feast" || card.cat === "Mary") ? "Feast day" : "When",
    facts,
    questions: seo.questions,
  };
}

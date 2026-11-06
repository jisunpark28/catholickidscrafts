/**
 * Unique SEO copy for each "When my child is…" moment.
 * Keys match src/data/moms-bible/situations.ts. Written so pages are not doorway templates.
 */
import { SITUATIONS } from "@/data/moms-bible/situations";

export type SituationSeo = {
  key: string;
  seoTitle: string;
  description: string;
  h1: string;
  /** Two short paragraphs for Catholic parents. */
  intro: readonly [string, string];
  /** Exactly three family-talk questions tailored to this moment. */
  questions: readonly [string, string, string];
};

export const SITUATION_SEO: readonly SituationSeo[] = [
  {
    key: "losing-a-pet",
    seoTitle: "Bible Verses for Kids Who Lost a Pet",
    description:
      "Catholic Scripture and gentle talk prompts for when your child is grieving a pet. Psalm 34 and Matthew 5 help you sit with the sadness together.",
    h1: "Bible verses for kids who lost a pet",
    intro: [
      "A pet's death can be a child's first real goodbye. Tears, questions about heaven, and a quiet house are all part of mourning — and your presence matters more than a perfect answer.",
      "These Catholic verses name sorrow without rushing past it. Read them slowly, then leave space for your child to talk, draw, or simply lean on you.",
    ],
    questions: [
      "What do you miss most about our pet today?",
      "When you feel sad, who or what helps you feel a little safer?",
      "How might God be close to us while we remember our pet with love?",
    ],
  },
  {
    key: "feeling-sad",
    seoTitle: "Bible Verses for Kids Who Feel Sad",
    description:
      "Catholic Bible verses for a sad child — Isaiah 41 and Psalm 147 — plus three family conversation questions you can use tonight.",
    h1: "Bible verses when your child feels sad",
    intro: [
      "Kids do not always have words for a heavy heart. A bad day at school, a friendship wobble, or a vague \"I just feel sad\" can leave parents guessing how to help.",
      "Scripture does not scold sadness. These verses remind your family that God stays near the brokenhearted, and that naming the feeling is already a brave first step.",
    ],
    questions: [
      "Can you point to where the sad feeling sits in your body?",
      "What is one kind thing someone could do for you right now?",
      "Which of these verses sounds most like what your heart needs?",
    ],
  },
  {
    key: "lonely",
    seoTitle: "Bible Verses for Lonely Kids",
    description:
      "Catholic verses for lonely children from Deuteronomy and John, with parent talk prompts that affirm friendship with God and with others.",
    h1: "Bible verses for kids who feel lonely",
    intro: [
      "Loneliness can sneak in on a crowded playground or a quiet afternoon at home. Your child may feel left out, new, or simply unseen — even when you are close by.",
      "These verses speak friendship and courage: God goes with us, and Jesus calls us friends. Use them to open a soft conversation, not a lecture.",
    ],
    questions: [
      "When did you feel most alone this week?",
      "Who is one person (or saint) you wish you could talk to more?",
      "What is one small way our family can help you feel included tomorrow?",
    ],
  },
  {
    key: "bullying",
    seoTitle: "Bible Verses for Kids Facing Bullying",
    description:
      "Catholic Scripture for kids dealing with bullying — Psalm 34 and Isaiah 41 — plus calm family questions that put dignity and safety first.",
    h1: "Bible verses for kids who are being bullied",
    intro: [
      "Hearing that your child is being picked on can stir anger and fear at once. Start by believing them, protecting them, and making clear that cruelty is never their fault.",
      "These verses name God's nearness to the crushed in spirit. Pair them with practical steps — talking to a teacher, practicing calm replies — so faith and safety walk together.",
    ],
    questions: [
      "What happened, and how did it make you feel inside?",
      "Who is a trusted adult at school you can go to for help?",
      "How can our family stand with you this week without making things worse?",
    ],
  },
  {
    key: "honesty",
    seoTitle: "Bible Verses About Honesty for Kids",
    description:
      "Catholic Bible verses about telling the truth for kids — Ephesians and Proverbs — with gentle questions after a lie, without shaming.",
    h1: "Bible verses when your child told a lie",
    intro: [
      "A lie often comes from fear of getting in trouble, not from a cold heart. Catholic parenting aims at formation: truth, repair, and a path back to trust.",
      "These verses honor honesty as love for one another. Read them after the storm settles, then practice a simple apology and a clearer next choice.",
    ],
    questions: [
      "What felt scary about telling the whole truth?",
      "How can we make things right with the person who was affected?",
      "What would honesty look like if this happened again tomorrow?",
    ],
  },
  {
    key: "anger",
    seoTitle: "Bible Verses for Angry Kids",
    description:
      "Catholic verses to help angry kids cool down — James and Ephesians — with family talk prompts about listening, kindness, and repair.",
    h1: "Bible verses when your child is angry",
    intro: [
      "Anger is energy that needs a home. Kids slam doors, shout, or shut down because they have not yet learned how to pause before they react.",
      "These verses invite listening first and kindness afterward. They do not erase frustration; they give your family a calmer script for the next round.",
    ],
    questions: [
      "What was the spark that lit your anger today?",
      "What helps your body calm down before words come out?",
      "Who needs a kind word or a fresh start from you now?",
    ],
  },
  {
    key: "sharing",
    seoTitle: "Bible Verses About Sharing for Kids",
    description:
      "Catholic Bible verses about sharing and the Golden Rule — Hebrews and Luke — with conversation ideas for siblings and friends.",
    h1: "Bible verses to help kids practice sharing",
    intro: [
      "Sharing is hard when a favorite toy feels like part of your child's identity. Forcing a hand-over can breed resentment; inviting generosity builds habit.",
      "These verses root sharing in love and the Golden Rule. Use them when toys, turns, or snacks become a battleground at home.",
    ],
    questions: [
      "What is easiest for you to share, and what feels hardest?",
      "How would you want a friend to treat your favorite thing?",
      "What is one generous choice you can try before dinner?",
    ],
  },
  {
    key: "screen-time",
    seoTitle: "Bible Verses About Screen Time for Kids",
    description:
      "Catholic Scripture for screen-time talks with kids — Romans 12 and Proverbs 4 — helping families guard hearts without constant battles.",
    h1: "Bible verses for screen-time conversations with kids",
    intro: [
      "Screens are not evil, but they are loud. When every free minute drifts toward a device, hearts and attention can thin out before anyone notices.",
      "These verses invite renewed minds and guarded hearts. Let them frame a family rule talk that is about freedom and focus, not only minutes on a clock.",
    ],
    questions: [
      "How do you feel in your body after a long stretch on a screen?",
      "What offline joy do you miss when screens take most of the day?",
      "What screen limit would help our whole family love each other better?",
    ],
  },
  {
    key: "moving",
    seoTitle: "Bible Verses for Kids Moving or Starting a New School",
    description:
      "Catholic verses for kids facing a move or new school — Joshua 1 and Psalm 23 — with talk prompts for courage on unfamiliar ground.",
    h1: "Bible verses for kids who are moving or starting a new school",
    intro: [
      "A new house or classroom can feel like the ground shifted overnight. Friends, routes, and little rituals disappear, and bravery has to be practiced one day at a time.",
      "These verses say \"be strong\" and \"the Lord is my shepherd\" without pretending change is easy. Pack them into the backpack with a snack and a hug.",
    ],
    questions: [
      "What are you most nervous about in this new place?",
      "What is one familiar comfort we can bring with us?",
      "Who do you hope will become a friend, and how might you say hello?",
    ],
  },
  {
    key: "nightmares",
    seoTitle: "Bible Verses for Kids with Nightmares",
    description:
      "Catholic bedtime verses for kids with nightmares — Psalm 4 and Philippians 4 — plus calm questions to pray peace over restless nights.",
    h1: "Bible verses for kids who have nightmares",
    intro: [
      "Night fears are real even when the dream is not. A nightlight, a rosary under the pillow, and a parent's steady voice often help more than logic.",
      "These verses speak rest and the peace of God that guards hearts. Read them as a short night prayer, then stay a minute longer if tears come.",
    ],
    questions: [
      "What part of the dream still feels sticky when you wake up?",
      "What helps you feel safe in your room at night?",
      "Shall we thank God for one good thing before we sleep?",
    ],
  },
  {
    key: "big-day",
    seoTitle: "Bible Verses for Kids Before a Big Test",
    description:
      "Catholic Scripture for test-day nerves — Philippians 4:13 and Proverbs 3 — with family questions that put trust ahead of panic.",
    h1: "Bible verses for kids facing a big test",
    intro: [
      "A big test can shrink a child's world to one score. Your job is not to erase nerves, but to remind them who they are beyond a grade.",
      "These verses root strength in Christ and trust in the Lord. Use them the night before — after the review sheet is put away.",
    ],
    questions: [
      "What part of the test feels hardest right now?",
      "What have you already prepared that you can thank God for?",
      "If the score is not what you hoped, how will our family still love you?",
    ],
  },
  {
    key: "anxiety",
    seoTitle: "Bible Verses for Anxious Kids",
    description:
      "Catholic Bible verses for childhood anxiety — Matthew 6 and 1 Peter 5 — with gentle questions that cast cares on God together.",
    h1: "Bible verses when your child feels anxious",
    intro: [
      "Anxiety can look like stomachaches, endless \"what ifs,\" or a child who cannot sleep. Faith does not mock those fears; it carries them.",
      "These verses invite living today and casting cares on God who cares. Keep expectations small: one verse, one breath, one honest talk.",
    ],
    questions: [
      "What worry keeps looping in your mind?",
      "What is one thing that is true and solid right now?",
      "How can we hand this worry to God together — in a prayer or a note?",
    ],
  },
  {
    key: "celebration",
    seoTitle: "Bible Verses for First Communion and Birthday Kids",
    description:
      "Catholic blessing verses for birthdays and First Communion — Numbers 6 and Jeremiah 29 — with joyful family talk prompts.",
    h1: "Bible verses for birthdays and First Communion",
    intro: [
      "Celebration days are holy, too. Whether it is a birthday cake or First Communion white, your child is being told they matter in the life of the Church and the family.",
      "These blessing verses speak God's face shining upon them and a future full of hope. Read them as a toast — Scripture as the first gift of the day.",
    ],
    questions: [
      "What are you most grateful for on this special day?",
      "How do you want to grow in faith this year?",
      "Who would you like to bless with a kind word today?",
    ],
  },
  {
    key: "just-because",
    seoTitle: "Bible Verses to Affirm Kids Just Because",
    description:
      "Catholic verses that tell kids they are loved — Zephaniah and 1 Corinthians 13 — for ordinary days that still need encouragement.",
    h1: "Bible verses that tell your child they are loved",
    intro: [
      "Some of the best Scripture moments are not crisis moments. A random Tuesday is a perfect time to say, out loud, that God delights in your child.",
      "These verses sing over your family with love that is patient and kind. Slip them into a lunchbox note or a bedtime blessing with no agenda attached.",
    ],
    questions: [
      "What is one way you felt loved today?",
      "How does it feel to know God rejoices over you?",
      "Who in our house could use an unexpected kindness tonight?",
    ],
  },
  {
    key: "dreams",
    seoTitle: "Bible Verses for Kids' Dreams and Gifts",
    description:
      "Catholic verses about kids' gifts and dreams — Matthew 5:16 and Ephesians 2:10 — encouraging light, purpose, and holy ambition.",
    h1: "Bible verses for your child's dreams and gifts",
    intro: [
      "Children dream big: astronaut, artist, helper, saint. Catholic parents get to cheer those dreams while pointing to the God who prepared good works in advance.",
      "These verses call your child's light into the open and name them God's handiwork. Use them when talents, hobbies, or vocation sparks show up at the dinner table.",
    ],
    questions: [
      "What dream has been on your heart lately?",
      "How could your gifts help someone else this month?",
      "Where do you already see God's light shining through you?",
    ],
  },
];

const BY_KEY = new Map(SITUATION_SEO.map((s) => [s.key, s]));

export function getSituationSeo(key: string): SituationSeo | null {
  return BY_KEY.get(key) ?? null;
}

/** Dev-time guard: every situation must have SEO copy. */
export function assertSituationSeoComplete(): void {
  for (const s of SITUATIONS) {
    if (!BY_KEY.has(s.key)) {
      throw new Error(`Missing situation SEO copy for key: ${s.key}`);
    }
  }
}

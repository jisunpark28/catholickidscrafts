/**
 * How the 300-moment source was folded into the four Mom's Bible groups.
 * Counts are checked by scripts/test-moms-bible.ts.
 */
export const DATASET_MOMENT_COUNT = 300;

export const OMITTED_DATASET_MOMENTS = [
  {
    "slug": "losing-a-pet",
    "sourceSlug": "losing-a-pet",
    "keptAs": "losing-a-pet",
    "reason": "Same moment and key as the existing Losing a Pet chip, which already cites Psalm 34:19 and Matthew 5:4."
  },
  {
    "slug": "anxiety-and-nightmares",
    "sourceSlug": "anxiety-and-nightmares",
    "keptAs": "nightmares",
    "reason": "Same bedtime-fear moment as Nightmares. The dataset cites Psalm 4:8, whose Catholic text is about corn, wine, and oil. The sleep line in the note is NABRE Psalm 4:9 (“In peace I will sleep”), already on the Nightmares chip with Philippians 4:6–7."
  },
  {
    "slug": "dealing-with-a-bully",
    "sourceSlug": "dealing-with-a-bully",
    "keptAs": "bullying",
    "reason": "Same moment as the existing Bullying chip (Psalm 34:18–19 and Isaiah 41:13). The dataset’s Psalm 18:2 is “I will love thee, O Lord, my strength,” not a second bullying moment."
  },
  {
    "slug": "dealing-with-anger-temper",
    "sourceSlug": "dealing-with-anger-temper",
    "keptAs": "anger",
    "reason": "Same moment as Anger. James 1:19 is already cited there. James 1:20 is the next verse in that chapter and was not added, so the existing chip stays unchanged."
  },
  {
    "slug": "telling-a-lie-honesty",
    "sourceSlug": "telling-a-lie-honesty",
    "keptAs": "honesty",
    "reason": "Same moment as Telling a Lie, which already cites Ephesians 4:25 and Proverbs 12:22."
  },
  {
    "slug": "moving-to-a-new-school-town",
    "sourceSlug": "moving-to-a-new-school-town",
    "keptAs": "moving",
    "reason": "Same moment as Moving / New School, which already cites Joshua 1:9 and Psalm 23:1–4."
  },
  {
    "slug": "fear-of-failure-exams",
    "sourceSlug": "fear-of-failure-exams",
    "keptAs": "big-day",
    "reason": "Same “before a big test” moment as Big Test (Philippians 4:13 and Proverbs 3:5–6). A failed grade is kept as its own chip."
  }
] as const;

export const RENUMBERED_REFS = [
  {
    "key": "fear-of-heights-or-climbing",
    "from": "Psalm 18:33",
    "to": "Psalm 18:34",
    "reason": "Psalm 18:33 is “girt with strength.” The note’s “feet … high places” is Psalm 18:34 (Douay Psalm 17:34)."
  },
  {
    "key": "waking-up-in-middle-of-night",
    "from": "Psalm 3:5",
    "to": "Psalm 3:6",
    "reason": "Psalm 3:5 is “I cried and he heard.” The night-rest line is Psalm 3:6 (“I have slept … the Lord hath protected me”)."
  },
  {
    "key": "fear-of-rides-or-rollercoasters",
    "from": "Psalm 56:3",
    "to": "Psalm 56:4",
    "reason": "Psalm 56:3 is about enemies. “When I am afraid, I will trust” is Psalm 56:4 (Douay Psalm 55:4)."
  },
  {
    "key": "crying-without-knowing-why",
    "from": "Psalm 56:8",
    "to": "Psalm 56:9",
    "reason": "Psalm 56:8 is a judgment line. “Tears in thy sight” is Psalm 56:9 (Douay Psalm 55:9)."
  },
  {
    "key": "feeling-embarrassed-or-humiliated",
    "from": "Psalm 34:5",
    "to": "Psalm 34:6",
    "reason": "Psalm 34:5 is “I sought the Lord.” “Your faces shall not be confounded” is Psalm 34:6 (Douay Psalm 33:6)."
  },
  {
    "key": "sadness-on-a-rainy-gloomy-day",
    "from": "Psalm 30:5",
    "to": "Psalm 30:6",
    "reason": "Psalm 30:5 is “Sing to the Lord.” “Weeping at evening, gladness in the morning” is Psalm 30:6 (Douay Psalm 29:6)."
  },
  {
    "key": "adopted-or-foster-child-belonging",
    "from": "Psalm 68:6",
    "to": "Psalm 68:7",
    "reason": "Psalm 68:6 is “father of orphans,” used for an absent parent. “God … to dwell in a house” is Psalm 68:7 (Douay Psalm 67:7)."
  },
  {
    "key": "child-in-the-hospital-or-surgery",
    "from": "Psalm 41:3",
    "to": "Psalm 41:4",
    "reason": "Psalm 41:3 is about enemies. The sickbed line is Psalm 41:4 (Douay Psalm 40:4, “bed of sorrow”)."
  },
  {
    "key": "when-mom-or-dad-is-seriously-ill",
    "from": "Psalm 46:1",
    "to": "Psalm 46:2",
    "reason": "Psalm 46:1 is only the superscription. “God is our refuge and strength” is Psalm 46:2 (Douay Psalm 45:2)."
  },
  {
    "key": "natural-disaster-storm-damage",
    "from": "Psalm 62:8",
    "to": "Psalm 62:9",
    "reason": "NABRE Psalm 62:8 is only a partial slice of Douay Psalm 61:8. “Trust in him … pour out your hearts” is Psalm 62:9 (Douay Psalm 61:9, exact)."
  },
  {
    "key": "missing-an-absent-parent",
    "from": "Psalm 68:5",
    "to": "Psalm 68:6",
    "reason": "Psalm 68:5 is a call to sing. “Father of orphans” is Psalm 68:6 (Douay Psalm 67:6)."
  },
  {
    "key": "curiosity-science-and-wonder-of-god",
    "from": "Psalm 19:1",
    "to": "Psalm 19:2",
    "reason": "Psalm 19:1 is only the superscription. “The heavens show forth the glory of God” is Psalm 19:2 (Douay Psalm 18:2)."
  }
] as const;

export const PARTIAL_REFS = [
  {
    "key": "waiting-for-medical-test-results",
    "label": "Psalm 112:7",
    "douay": "psalms 111:7",
    "quality": "partial",
    "reason": "NABRE Psalm 112:6 and 112:7 share Douay Psalm 111:7. That verse contains “he shall not fear the evil hearing,” the medical-news line, so the link opens it."
  },
  {
    "key": "praying-for-my-childs-future-spouse-vocation",
    "label": "Tobit 8:7",
    "douay": "tobias 8:9–10",
    "quality": "partial",
    "reason": "NABRE Tobit 8:7 spans Douay Tobias 8:9–10, Tobias and Sarah’s wedding prayer. The reader opens 8:9 and the card includes both verses."
  }
] as const;

export const SANITIZED_DATASET_KEYS = [
  {
    "from": "saying- say-sorry-to-mom-or-dad",
    "to": "saying-sorry-to-mom-or-dad"
  },
  {
    "from": "To-my-daughter-identity-in-christ",
    "to": "to-my-daughter-identity-in-christ"
  }
] as const;

/** Care lines for the original chips. New moments carry their own care field. */
export const EXISTING_SITUATION_CARE = {
  "bullying": "Bullying is not something to put up with or pray away. Tell a parent or another trusted adult so they can help keep you safe.",
  "anxiety": "If worry stops you from sleeping, eating, or going to school, tell a trusted adult. Prayer can sit with you; it does not replace help.",
  "nightmares": "If a bad dream wakes you, get a parent. You do not have to stay scared alone.",
  "feeling-sad": "If the sadness stays heavy for a long time, tell a trusted adult."
} as const;

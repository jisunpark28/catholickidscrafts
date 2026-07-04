import { LENT_WK1_SHARE_SLUG, lentWk1TemplateSeed } from "./data/lent-wk1-kit";
import {
  MASS_ETIQUETTE_LOWER_SLUG,
  massEtiquetteLowerTemplateSeed,
} from "./data/mass-etiquette-lower-kit";
import { upsertGlobalTemplate } from "@/lib/lesson-kit/db";
import { getTptStoreUrl } from "@/lib/tpt";
import type { PrismaClient } from "@prisma/client";

const GLOBAL_TEMPLATE_SEEDS = [
  () => lentWk1TemplateSeed(getTptStoreUrl()),
  () => massEtiquetteLowerTemplateSeed(getTptStoreUrl()),
  () => ({
    shareSlug: "advent-warmup",
    title: "Advent warm-up",
    description: "Purple time: colors, words, and a short Gospel.",
    liturgicalPeriod: "advent",
    gradeBand: "Grade 2",
    sortOrder: 1,
    familyMode: { gospelMaxChars: 150 },
    blocks: [
      {
        sortOrder: 0,
        type: "PLAY_GAME" as const,
        label: "Liturgical colors",
        config: { gameSlug: "liturgical-vestments" },
      },
      {
        sortOrder: 1,
        type: "TYPING_WORDS" as const,
        label: "Advent words",
        config: { wordPreset: "advent" },
      },
      {
        sortOrder: 2,
        type: "GOSPEL_TYPING" as const,
        label: "Today's Gospel",
        config: { readingKind: "gospel", maxChars: 400, familyInclude: true },
      },
    ],
  }),
  () => ({
    shareSlug: "sunday-starter",
    title: "Sunday starter",
    description: "Calendar, hangman, and a teacher note.",
    gradeBand: "All grades",
    sortOrder: 2,
    blocks: [
      { sortOrder: 0, type: "MASS_TODAY" as const, label: "Today", config: {} },
      {
        sortOrder: 1,
        type: "HANGMAN_WORDS" as const,
        label: "Catholic hangman",
        config: { gameSlug: "hangman" },
      },
      {
        sortOrder: 2,
        type: "CUSTOM_NOTE" as const,
        label: "Discussion",
        config: {
          html: "<p>What did we celebrate at Mass this Sunday?</p>",
          familyInclude: false,
        },
      },
    ],
  }),
  () => ({
    shareSlug: "communion-words",
    title: "Communion words",
    description: "Eucharist vocabulary and a craft link.",
    gradeBand: "First Communion",
    sortOrder: 3,
    blocks: [
      {
        sortOrder: 0,
        type: "TYPING_WORDS" as const,
        label: "Communion words",
        config: { wordPreset: "communion" },
      },
      {
        sortOrder: 1,
        type: "RESOURCE" as const,
        label: "First Communion craft",
        config: { resourceSlug: "first-communion-examination", familyInclude: false },
      },
    ],
  }),
];

export async function seedLessonKits(_prisma: PrismaClient) {
  for (const build of GLOBAL_TEMPLATE_SEEDS) {
    const data = build();
    await upsertGlobalTemplate(data);
    console.log(`Lesson template: ${data.shareSlug}`);
  }

  console.log(
    `Upserted ${GLOBAL_TEMPLATE_SEEDS.length} global lesson templates (showcase: /lesson/${LENT_WK1_SHARE_SLUG}, /lesson/${MASS_ETIQUETTE_LOWER_SLUG})`,
  );
}

import { createGlobalTemplate } from "@/lib/lesson-kit/db";
import type { PrismaClient } from "@prisma/client";

export async function seedLessonKits(_prisma: PrismaClient) {
  const existing = await _prisma.lessonKit.count({
    where: { scope: "GLOBAL_TEMPLATE" },
  });
  if (existing > 0) {
    console.log("Lesson templates already seeded — skip");
    return;
  }

  await createGlobalTemplate({
    title: "Advent warm-up",
    description: "Purple time: colors, words, and a short Gospel.",
    liturgicalPeriod: "advent",
    gradeBand: "Grade 2",
    sortOrder: 1,
    familyMode: { gospelMaxChars: 150 },
    blocks: [
      {
        sortOrder: 0,
        type: "PLAY_GAME",
        label: "Liturgical colors",
        config: { gameSlug: "liturgical-vestments" },
      },
      {
        sortOrder: 1,
        type: "TYPING_WORDS",
        label: "Advent words",
        config: { wordPreset: "advent" },
      },
      {
        sortOrder: 2,
        type: "GOSPEL_TYPING",
        label: "Today's Gospel",
        config: { readingKind: "gospel", maxChars: 400, familyInclude: true },
      },
    ],
  });

  await createGlobalTemplate({
    title: "Sunday starter",
    description: "Calendar, hangman, and a teacher note.",
    gradeBand: "All grades",
    sortOrder: 2,
    blocks: [
      { sortOrder: 0, type: "MASS_TODAY", label: "Today", config: {} },
      {
        sortOrder: 1,
        type: "HANGMAN_WORDS",
        label: "Catholic hangman",
        config: { gameSlug: "hangman" },
      },
      {
        sortOrder: 2,
        type: "CUSTOM_NOTE",
        label: "Discussion",
        config: {
          html: "<p>What did we celebrate at Mass this Sunday?</p>",
          familyInclude: false,
        },
      },
    ],
  });

  await createGlobalTemplate({
    title: "Communion words",
    description: "Eucharist vocabulary and a craft link.",
    gradeBand: "First Communion",
    sortOrder: 3,
    blocks: [
      {
        sortOrder: 0,
        type: "TYPING_WORDS",
        label: "Communion words",
        config: { wordPreset: "communion" },
      },
      {
        sortOrder: 1,
        type: "RESOURCE",
        label: "First Communion craft",
        config: { resourceSlug: "first-communion-examination", familyInclude: false },
      },
    ],
  });

  console.log("Seeded 3 global lesson templates");
}

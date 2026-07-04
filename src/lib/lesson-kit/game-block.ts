import type { LessonBlockDto, LessonBlockConfig } from "@/lib/lesson-kit/types";

export const LESSON_GAME_FORMATS = [
  { id: "hangman", label: "Hangman" },
  { id: "typing", label: "Typing" },
  { id: "picture_match", label: "Picture match" },
  { id: "fill_blank", label: "Fill in the blank" },
  { id: "true_false", label: "True / False" },
  { id: "multiple_choice", label: "Multiple choice" },
] as const;

export type LessonGameFormat = (typeof LESSON_GAME_FORMATS)[number]["id"];

export type PictureMatchPair = { imageUrl: string; word: string };
export type TrueFalseItem = { statement: string; answer: boolean };
export type MultipleChoiceItem = {
  question: string;
  choices: string[];
  correctIndex: number;
};

export function lessonGameFormat(block: LessonBlockDto): LessonGameFormat {
  const raw = block.config.gameFormat;
  if (LESSON_GAME_FORMATS.some((f) => f.id === raw)) {
    return raw as LessonGameFormat;
  }
  return "hangman";
}

export function parseWordList(raw: string): string[] {
  return [...new Set(raw.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean))];
}

export function lessonGameWords(block: LessonBlockDto): string[] {
  const fromConfig = block.config.gameWords;
  if (Array.isArray(fromConfig) && fromConfig.length > 0) {
    return fromConfig.map((w) => String(w).trim()).filter(Boolean);
  }
  if (Array.isArray(block.config.words) && block.config.words.length > 0) {
    return block.config.words.map((w) => String(w).trim()).filter(Boolean);
  }
  return [];
}

export function lessonGameHint(block: LessonBlockDto): string {
  return String(block.config.gameHint ?? "").trim();
}

export function lessonTypingMode(block: LessonBlockDto): "words" | "passage" {
  return block.config.typingMode === "passage" ? "passage" : "words";
}

export function lessonGamePassage(block: LessonBlockDto): string {
  return String(block.config.gamePassage ?? "").trim();
}

export function lessonPictureMatchPairs(block: LessonBlockDto): PictureMatchPair[] {
  const raw = block.config.pictureMatch;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const imageUrl = String(row.imageUrl ?? "").trim();
      const word = String(row.word ?? "").trim();
      if (!imageUrl || !word) return null;
      return { imageUrl, word };
    })
    .filter((p): p is PictureMatchPair => Boolean(p));
}

export function lessonFillBlankText(block: LessonBlockDto): string {
  return String(block.config.fillBlankText ?? "").trim();
}

export function lessonFillBlankAnswers(block: LessonBlockDto): string[] {
  const raw = block.config.fillBlankAnswers;
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => String(a).trim());
}

export function lessonFillBlankParts(block: LessonBlockDto): { parts: string[]; blankCount: number } {
  const text = lessonFillBlankText(block);
  const parts = text.split("___");
  return { parts, blankCount: Math.max(0, parts.length - 1) };
}

export function lessonTrueFalseItems(block: LessonBlockDto): TrueFalseItem[] {
  const raw = block.config.trueFalseItems;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const statement = String(row.statement ?? "").trim();
      if (!statement) return null;
      return { statement, answer: Boolean(row.answer) };
    })
    .filter((p): p is TrueFalseItem => Boolean(p));
}

export function lessonMultipleChoiceItems(block: LessonBlockDto): MultipleChoiceItem[] {
  const raw = block.config.multipleChoiceItems;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = String(row.question ?? "").trim();
      const choices = Array.isArray(row.choices)
        ? row.choices.map((c) => String(c).trim()).filter(Boolean)
        : [];
      const correctIndex = Number(row.correctIndex ?? 0);
      if (!question || choices.length < 2) return null;
      return {
        question,
        choices,
        correctIndex: Math.min(choices.length - 1, Math.max(0, correctIndex)),
      };
    })
    .filter((p): p is MultipleChoiceItem => Boolean(p));
}

export function lessonGamePrintAnswerKey(block: LessonBlockDto): boolean {
  return block.config.printAnswerKey !== false;
}

export function defaultGameConfig(format: LessonGameFormat = "hangman"): LessonBlockConfig {
  switch (format) {
    case "typing":
      return {
        gameFormat: "typing",
        typingMode: "words",
        gameWords: ["advent", "lent", "prayer", "jesus", "amen"],
        gamePassage: "",
      };
    case "picture_match":
      return {
        gameFormat: "picture_match",
        pictureMatch: [{ imageUrl: "", word: "" }],
      };
    case "fill_blank":
      return {
        gameFormat: "fill_blank",
        fillBlankText: "During Lent we pray, fast, and give ___.",
        fillBlankAnswers: ["alms"],
      };
    case "true_false":
      return {
        gameFormat: "true_false",
        trueFalseItems: [
          { statement: "Purple is a Lent liturgical color.", answer: true },
          { statement: "Easter is in Advent.", answer: false },
        ],
      };
    case "multiple_choice":
      return {
        gameFormat: "multiple_choice",
        multipleChoiceItems: [
          {
            question: "How many days are in Lent (not counting Sundays)?",
            choices: ["20", "30", "40", "50"],
            correctIndex: 2,
          },
        ],
      };
    case "hangman":
    default:
      return {
        gameFormat: "hangman",
        gameWords: ["advent", "lent", "prayer", "alleluia", "mercy"],
        gameHint: "Church words",
      };
  }
}

export function gameFormatSummary(block: LessonBlockDto): string {
  const format = lessonGameFormat(block);
  switch (format) {
    case "hangman":
      return `Hangman · ${lessonGameWords(block).join(", ") || "(no words)"}`;
    case "typing":
      return lessonTypingMode(block) === "passage"
        ? `Typing · passage (${lessonGamePassage(block).length} chars)`
        : `Typing · ${lessonGameWords(block).join(", ") || "(no words)"}`;
    case "picture_match":
      return `Picture match · ${lessonPictureMatchPairs(block).length} pair(s)`;
    case "fill_blank":
      return `Fill in the blank · ${lessonFillBlankParts(block).blankCount} blank(s)`;
    case "true_false":
      return `True/False · ${lessonTrueFalseItems(block).length} question(s)`;
    case "multiple_choice":
      return `Multiple choice · ${lessonMultipleChoiceItems(block).length} question(s)`;
    default:
      return format;
  }
}

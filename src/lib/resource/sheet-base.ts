import { getSundaySheet, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import { keyToSlug, yearLabel } from "@/lib/resource/sheets";
import { z } from "zod";

/** Tiny stable hash (browser + Node) for base revision ids. */
function shortHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Letter page at 96 CSS px/in (Fabric / measurement coordinate space). */
export const SHEET_PAGE = { width: 816, height: 1056, unit: "css-px" as const, paper: "letter" as const };

/** Editable overlay fields (Base SVG hides these; Fabric Textboxes cover them). */
export const SHEET_EDIT_FIELDS = [
  "title",
  "story",
  "keyLine",
  "q0",
  "q1",
  "action0",
  "action1",
  "action2",
  "prayer",
] as const;

export type SheetEditField = (typeof SHEET_EDIT_FIELDS)[number];

export const sheetBoxSchema = z.object({
  /** Core field id or dynamic id from live DOM (`auto_*`, `actTitle`, …). */
  id: z.string().min(1).max(64),
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  /** Default font size hint for Fabric Textbox. */
  fontSize: z.number().optional(),
  /** Captured plain text when measured from the live HTML underlay. */
  text: z.string().max(2000).optional(),
});

export const sheetLayoutSchema = z.object({
  v: z.literal(1),
  key: z.string(),
  level: z.union([z.literal(1), z.literal(2)]),
  paper: z.literal("letter"),
  rev: z.string(),
  page: z.object({ width: z.number(), height: z.number() }),
  boxes: z.array(sheetBoxSchema),
});

export type SheetLayout = z.infer<typeof sheetLayoutSchema>;

/** Content revision: when sheet JSON changes, editors get a conflict choice. */
export function sheetBaseRev(sheet: SundaySheetContent, level: 1 | 2): string {
  const c = level === 2 ? sheet.levels.level2 : sheet.levels.level1;
  const payload = JSON.stringify({
    key: sheet.key,
    level,
    liturgicalName: sheet.liturgicalName,
    gospelRef: sheet.gospelRef,
    color: sheet.color,
    title: c.title,
    story: c.story,
    keyLine: c.keyLine,
    questions: c.questions,
    actions: c.actions,
    prayer: c.prayer,
    activity: c.activity ?? null,
  });
  return shortHash(payload);
}

export function sheetBasePublicPaths(key: string, level: 1 | 2) {
  const slug = keyToSlug(key);
  const stem = `${slug}-l${level}`;
  return {
    stem,
    layout: `/sheet-bases/${stem}.json`,
    png: `/sheet-bases/${stem}.png`,
    fsLayout: `public/sheet-bases/${stem}.json`,
    fsPng: `public/sheet-bases/${stem}.png`,
  };
}

export function defaultTextForField(sheet: SundaySheetContent, level: 1 | 2, id: string): string {
  const c = level === 2 ? sheet.levels.level2 : sheet.levels.level1;
  switch (id) {
    case "title":
      return c.title;
    case "story":
      return c.story;
    case "keyLine":
      return c.keyLine;
    case "q0":
      return c.questions[0] ?? "";
    case "q1":
      return c.questions[1] ?? "";
    case "action0":
      return c.actions[0] ?? "";
    case "action1":
      return c.actions[1] ?? "";
    case "action2":
      return c.actions[2] ?? "";
    case "prayer":
      return c.prayer;
    case "subtitle":
      return `${sheet.liturgicalName} · Level ${level}`;
    case "meta":
      return `${yearLabel(sheet.key)}\n${sheet.gospelRef}`;
    case "h2_story":
      return "Today's Story";
    case "h2_key":
      return level === 1 ? "Trace the words" : "Copy the key line";
    case "h2_talk":
      return level === 1 ? "Let's talk" : "Think about it";
    case "h2_actions":
      return "This week I will…";
    case "footer":
      return "New free sheet every week at catholickidscrafts.com";
    default:
      return "";
  }
}

export function fontSizeHint(level: 1 | 2, id: string): number {
  if (id === "title") return 24;
  if (id === "story") return level === 1 ? 18 : 15;
  if (id === "keyLine") return level === 1 ? 30 : 17;
  if (id === "prayer") return 16;
  if (id === "subtitle" || id === "meta") return 14;
  if (id === "actTitle" || id.startsWith("h2_")) return 15;
  if (id === "actIntro") return level === 1 ? 15 : 13;
  if (id === "footer") return 11;
  if (id.startsWith("q")) return 14;
  return 15;
}

/** Build empty layout shell (boxes filled by measurement). */
export function emptyLayout(key: string, level: 1 | 2, rev: string): SheetLayout {
  return {
    v: 1,
    key,
    level,
    paper: "letter",
    rev,
    page: { width: SHEET_PAGE.width, height: SHEET_PAGE.height },
    boxes: [],
  };
}

export function requireSheet(key: string): SundaySheetContent {
  const sheet = getSundaySheet(key);
  if (!sheet) throw new Error(`Unknown sheet key: ${key}`);
  return sheet;
}

import { z } from "zod";

/** Activity in the sheet's 3rd section. Discriminated on `type`; data comes from the TOC spreadsheet. */
const s = (max: number) => z.string().trim().min(1).max(max);

export const SHAPES = ["crown", "lamp", "star", "fish", "boat", "candle", "door", "cross", "house", "heart"] as const;
export type ShapeName = (typeof SHAPES)[number];

/** Optional per-idea heading/instruction overrides (every type except the legacy heart). */
const base = { title: s(60).optional(), intro: z.string().trim().max(200).optional(), idea: z.number().int().min(1).max(150).optional() };
const word = z.string().regex(/^[A-Z]{3,10}$/);
const list = (max: number, min: number, most: number) => z.array(s(max)).min(min).max(most);

export const sheetActivitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heart"), title: s(60), a: s(40), b: s(40), intro: z.string().max(300).optional() }),
  z.object({ ...base, type: z.literal("maze"), start: s(30), goal: s(30) }),
  z.object({ ...base, type: z.literal("matchup"), pairs: z.array(z.tuple([s(80), s(90)])).min(3).max(5), text: z.boolean().optional() }),
  z.object({ ...base, type: z.literal("sequence"), scenes: z.array(s(160)).min(3).max(6) }),
  z.object({ ...base, type: z.literal("wordfind"), words: z.array(z.string().regex(/^[A-Z]{3,10}$/)).min(3).max(8) }),
  z.object({ ...base, type: z.literal("fillblank"), text: s(120).refine((t) => /\[[^\]]+\]/.test(t), "Mark blanks with [word]") }),
  z.object({ ...base, type: z.literal("drawscene"), prompt: s(140) }),
  z.object({ ...base, type: z.literal("findhidden"), objects: z.array(s(30)).min(3).max(6) }),
  z.object({ ...base, type: z.literal("shapecraft"), shape: z.enum(SHAPES), label: s(30) }),
  z.object({ ...base, type: z.literal("secretcode"), message: s(70) }),
  z.object({
    ...base,
    type: z.literal("sorting"),
    left: s(30),
    right: s(30),
    items: z.array(z.tuple([s(40), z.enum(["L", "R"])])).min(4).max(6),
  }),
  z.object({ ...base, type: z.literal("dottodot"), shape: z.enum(SHAPES) }),
  z.object({ ...base, type: z.literal("prayerframe"), starters: z.array(s(40)).min(3).max(5) }),
  z.object({ ...base, type: z.literal("speech"), characters: list(30, 1, 3) }),
  z.object({ ...base, type: z.literal("faces"), people: list(30, 2, 4) }),
  z.object({ ...base, type: z.literal("symmetry"), shape: z.enum(SHAPES) }),
  z.object({ ...base, type: z.literal("colornum"), shape: z.enum(SHAPES), mode: z.enum(["key", "even"]) }),
  z.object({ ...base, type: z.literal("crossword"), entries: z.array(z.tuple([word, s(60)])).min(3).max(6) }),
  z.object({ ...base, type: z.literal("spotdiff"), count: z.number().int().min(3).max(5), scene: s(80) }),
  z.object({ ...base, type: z.literal("sudoku"), symbols: z.array(z.string().min(1).max(2)).length(4), names: list(12, 4, 4) }),
  z.object({
    ...base,
    type: z.literal("fixwords"),
    text: s(160).refine((t) => /\{[^|}]+\|[^}]+\}/.test(t), "Mark mistakes with {shown|correct}"),
  }),
  z.object({ ...base, type: z.literal("wordorder"), pieces: list(40, 3, 10) }),
  z.object({ ...base, type: z.literal("truefalse"), items: z.array(z.tuple([s(90), z.boolean()])).min(3).max(5) }),
  z.object({ ...base, type: z.literal("whoami"), clues: list(80, 3, 3), answer: s(30), choices: list(30, 2, 4).optional() }),
  z.object({ ...base, type: z.literal("bingo"), words: list(14, 9, 9) }),
  z.object({ ...base, type: z.literal("tracker"), rows: list(30, 1, 3) }),
  z.object({ ...base, type: z.literal("tally"), words: list(14, 2, 4) }),
  z.object({ ...base, type: z.literal("foldreveal"), question: s(90), answer: s(120) }),
  z.object({ ...base, type: z.literal("hand"), fingers: list(24, 5, 5) }),
  z.object({ ...base, type: z.literal("thermometer"), levels: list(30, 3, 5) }),
  z.object({ ...base, type: z.literal("scale"), left: s(30), right: s(30) }),
  z.object({ ...base, type: z.literal("clock"), labels: list(20, 1, 3) }),
  z.object({ ...base, type: z.literal("beads"), count: z.number().int().min(5).max(50), label: s(40) }),
  z.object({
    ...base,
    type: z.literal("candles"),
    candles: z.array(z.tuple([s(24), z.enum(["light", "dark", "white"])])).min(1).max(7),
  }),
  z.object({ ...base, type: z.literal("badge"), label: s(24) }),
  z.object({ ...base, type: z.literal("tree"), leaves: z.number().int().min(3).max(6), label: s(30) }),
  z.object({
    ...base,
    type: z.literal("letter"),
    style: z.enum(["letter", "certificate", "card"]),
    to: s(40),
    lines: z.number().int().min(2).max(5),
  }),
  z.object({ ...base, type: z.literal("checklist"), items: list(60, 3, 6) }),
  z.object({ ...base, type: z.literal("acrostic"), word: z.string().regex(/^[A-Z]{3,8}$/) }),
  z.object({ ...base, type: z.literal("copyverse"), text: s(120), mirror: z.boolean().optional() }),
]);

export type SheetActivity = z.infer<typeof sheetActivitySchema>;
export type SheetActivityType = SheetActivity["type"];
export type ActivityOf<T extends SheetActivityType> = Extract<SheetActivity, { type: T }>;

export const ACTIVITY_TYPES = [
  "heart",
  "maze",
  "matchup",
  "sequence",
  "wordfind",
  "fillblank",
  "drawscene",
  "findhidden",
  "shapecraft",
  "secretcode",
  "sorting",
  "dottodot",
  "prayerframe",
  "speech",
  "faces",
  "symmetry",
  "colornum",
  "crossword",
  "spotdiff",
  "sudoku",
  "fixwords",
  "wordorder",
  "truefalse",
  "whoami",
  "bingo",
  "tracker",
  "tally",
  "foldreveal",
  "hand",
  "thermometer",
  "scale",
  "clock",
  "beads",
  "candles",
  "badge",
  "tree",
  "letter",
  "checklist",
  "acrostic",
  "copyverse",
] as const satisfies readonly SheetActivityType[];

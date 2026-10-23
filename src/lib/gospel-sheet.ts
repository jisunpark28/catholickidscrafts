import { prisma } from "@/lib/prisma";
import { colorDot, formatSunday, parseDateInput, toDateInput } from "@/lib/weekly-content";
import { z } from "zod";

import { type GospelSheetLevel, gospelSheetLevelSchema } from "@/lib/gospel-sheet-schema";
import { type SheetLevelNumber, parseLevelParam } from "@/lib/gospel-sheet-level";

export { gospelSheetLevelSchema, parseLevelParam };
export type { GospelSheetLevel, SheetLevelNumber };

export type GospelSheetLevels = { level1: GospelSheetLevel; level2: GospelSheetLevel };

export type GospelSheetView = {
  id: string;
  slug: string;
  sundayDate: string;
  sundayLabel: string;
  liturgicalName: string;
  gospelRef: string;
  usccbUrl: string;
  color: string;
  dotColor: string;
  published: boolean;
  featured: boolean;
  levels: GospelSheetLevels;
};


const line = (max: number) => z.string().trim().max(max);

export const gospelSheetLevelsSchema = z.object({
  level1: gospelSheetLevelSchema,
  level2: gospelSheetLevelSchema,
});

export const gospelSheetSchema = z.object({
  sundayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  liturgicalName: line(120).min(1),
  gospelRef: line(80).min(1),
  usccbUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Use an https:// URL"),
  color: line(20),
  published: z.boolean(),
  featured: z.boolean(),
  levels: gospelSheetLevelsSchema,
});

export type GospelSheetInput = z.infer<typeof gospelSheetSchema>;

export function emptyLevel(): GospelSheetLevel {
  return {
    title: "",
    story: "",
    keyLine: "",
    heartTitle: "",
    heartIntro: "",
    heartLabelA: "",
    heartLabelB: "",
    questions: ["", ""],
    actions: ["", "", ""],
    prayer: "",
  };
}

/** Slug used in /print/[slug], e.g. "2026-10-25". */
export function sheetSlug(sundayDate: string): string {
  return sundayDate;
}

export function parseLevels(raw: unknown): GospelSheetLevels {
  const parsed = gospelSheetLevelsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return { level1: emptyLevel(), level2: emptyLevel() };
}

type SheetRow = {
  id: string;
  slug: string;
  sundayDate: Date;
  liturgicalName: string;
  gospelRef: string;
  usccbUrl: string;
  color: string;
  published: boolean;
  featured: boolean;
  levels: unknown;
};

export function toSheetView(row: SheetRow): GospelSheetView {
  return {
    id: row.id,
    slug: row.slug,
    sundayDate: toDateInput(row.sundayDate),
    sundayLabel: formatSunday(row.sundayDate),
    liturgicalName: row.liturgicalName,
    gospelRef: row.gospelRef,
    usccbUrl: row.usccbUrl,
    color: row.color,
    dotColor: colorDot(row.color || "green"),
    published: row.published,
    featured: row.featured,
    levels: parseLevels(row.levels),
  };
}

export function sheetCreateData(input: GospelSheetInput) {
  const sundayDate = parseDateInput(input.sundayDate);
  if (!sundayDate) throw new Error("Invalid date");
  return {
    slug: sheetSlug(input.sundayDate),
    sundayDate,
    liturgicalName: input.liturgicalName,
    gospelRef: input.gospelRef,
    usccbUrl: input.usccbUrl,
    color: input.color || "green",
    published: input.published,
    featured: input.featured,
    levels: input.levels,
  };
}

/** Admin-featured published sheet, else the latest published one. */
export async function loadFeaturedSheet(): Promise<GospelSheetView | null> {
  try {
    const featured = await prisma.gospelSheet.findFirst({
      where: { published: true, featured: true },
      orderBy: { sundayDate: "desc" },
    });
    const row =
      featured ??
      (await prisma.gospelSheet.findFirst({
        where: { published: true },
        orderBy: { sundayDate: "desc" },
      }));
    return row ? toSheetView(row) : null;
  } catch (e) {
    console.error("loadFeaturedSheet", e);
    return null;
  }
}

/** Published sheet by slug. Admins can preview drafts. */
export async function loadSheetBySlug(slug: string, includeDrafts = false): Promise<GospelSheetView | null> {
  if (!/^[a-z0-9-]{1,40}$/.test(slug)) return null;
  try {
    const row = await prisma.gospelSheet.findUnique({ where: { slug } });
    if (!row || (!row.published && !includeDrafts)) return null;
    return toSheetView(row);
  } catch (e) {
    console.error("loadSheetBySlug", e);
    return null;
  }
}

/** YYYY-MM-DD of "today" in America/Toronto. */
export function torontoToday(now = new Date()): { ymd: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { ymd: `${get("year")}-${get("month")}-${get("day")}`, weekday: days.indexOf(get("weekday")) };
}

/** The coming Sunday (today if it is Sunday) in Toronto, as a @db.Date value. */
export function upcomingSunday(now = new Date()): Date {
  const { ymd, weekday } = torontoToday(now);
  const base = new Date(`${ymd}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + ((7 - weekday) % 7));
  return base;
}

import { prisma } from "@/lib/prisma";
import type { LiturgyCard } from "@/lib/liturgy-cards";
import { isLiturgyTopic, type LiturgyTopic } from "@/lib/liturgy-topics";

export const WEEKLY_ITEM_TYPES = ["coloring", "worksheet", "catechism", "craft", "bundle"] as const;
export type WeeklyItemType = (typeof WEEKLY_ITEM_TYPES)[number];

export const WEEKLY_ITEM_TYPE_LABELS: Record<WeeklyItemType, string> = {
  coloring: "Coloring",
  worksheet: "Worksheet",
  catechism: "Catechism",
  craft: "Craft",
  bundle: "Bundle",
};

export const WEEKLY_CYCLES = ["A", "B", "C"] as const;

/** Liturgical colors with a dot color for the public header. */
export const WEEKLY_COLORS: Record<string, string> = {
  green: "#3f8f4f",
  violet: "#7a4fa0",
  white: "#f4efe6",
  red: "#c0392b",
  rose: "#e48fa8",
  gold: "#d4a63a",
};

export function isWeeklyItemType(value: string): value is WeeklyItemType {
  return (WEEKLY_ITEM_TYPES as readonly string[]).includes(value);
}

export function weeklyTypeLabel(type: string): string {
  return isWeeklyItemType(type) ? WEEKLY_ITEM_TYPE_LABELS[type] : type;
}

export function colorDot(color: string): string {
  const key = color.trim().toLowerCase();
  if (WEEKLY_COLORS[key]) return WEEKLY_COLORS[key];
  return /^#[0-9a-f]{3,8}$/i.test(key) ? key : "#c9c1b6";
}

/** YYYY-MM-DD for a @db.Date value (stored at UTC midnight). */
export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatSunday(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type ItemRow = { id: string; title: string; type: string; fileUrl: string; thumbUrl: string };

export function weeklyItemToCard(item: ItemRow): LiturgyCard {
  return {
    id: `weekly-${item.id}`,
    title: item.title,
    href: item.fileUrl,
    imageUrl: item.thumbUrl || undefined,
    badge: weeklyTypeLabel(item.type),
  };
}

export type WeeklyThisWeek = {
  title: string;
  sundayLabel: string;
  gospelRef: string;
  season: string;
  cycle: string;
  dotColor: string;
  cards: LiturgyCard[];
};

/** Latest published issue (all items, any topic). */
export async function loadThisWeek(): Promise<WeeklyThisWeek | null> {
  try {
    const issue = await prisma.weeklyIssue.findFirst({
      where: { published: true },
      orderBy: { sundayDate: "desc" },
      include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    });
    if (!issue || issue.items.length === 0) return null;
    return {
      title: issue.title,
      sundayLabel: formatSunday(issue.sundayDate),
      gospelRef: issue.gospelRef,
      season: issue.season,
      cycle: issue.cycle,
      dotColor: colorDot(issue.color),
      cards: issue.items.map(weeklyItemToCard),
    };
  } catch {
    return null;
  }
}

/** Published weekly items tagged with this topic, newest Sunday first. */
export async function loadWeeklyCardsForTopic(topic: LiturgyTopic): Promise<LiturgyCard[]> {
  if (!isLiturgyTopic(topic)) return [];
  try {
    const items = await prisma.weeklyItem.findMany({
      where: { topic, issue: { published: true } },
      orderBy: [{ issue: { sundayDate: "desc" } }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return items.map(weeklyItemToCard);
  } catch {
    return [];
  }
}
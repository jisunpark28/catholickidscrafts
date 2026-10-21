import { isLiturgyCardLink, isLiturgyTopic } from "@/lib/liturgy-topics";
import { isWeeklyItemType } from "@/lib/weekly-content";
import { z } from "zod";

const link = z
  .string()
  .trim()
  .refine(isLiturgyCardLink, "Use a site path or an http(s) URL");

export const weeklyItemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  type: z.string().refine(isWeeklyItemType, "Unknown type"),
  fileUrl: link,
  thumbUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || isLiturgyCardLink(v), "Thumbnail must be a site path or an http(s) URL"),
  topic: z
    .string()
    .nullable()
    .refine((v) => v === null || v === "" || isLiturgyTopic(v), "Unknown topic"),
});

export const weeklyIssueSchema = z.object({
  sundayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a Sunday date"),
  title: z.string().trim().min(1).max(160),
  season: z.string().trim().max(80),
  cycle: z.enum(["", "A", "B", "C"]),
  gospelRef: z.string().trim().max(80),
  color: z.string().trim().max(40),
  published: z.boolean(),
  items: z.array(weeklyItemSchema).max(60),
});

export type WeeklyIssueInput = z.infer<typeof weeklyIssueSchema>;

export function itemsCreateData(items: WeeklyIssueInput["items"]) {
  return items.map((item, index) => ({
    title: item.title,
    type: item.type,
    fileUrl: item.fileUrl,
    thumbUrl: item.thumbUrl,
    topic: item.topic ? item.topic : null,
    sortOrder: index,
  }));
}
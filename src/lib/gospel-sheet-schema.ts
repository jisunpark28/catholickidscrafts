import { z } from "zod";
import { type SheetActivity, sheetActivitySchema } from "@/lib/sheet-activities/schema";

/** Content for one level of a Sunday Gospel sheet. Original retellings only (no NRSV/NABRE text). */
export type GospelSheetLevel = {
  title: string;
  story: string;
  keyLine: string;
  heartTitle: string;
  heartIntro: string;
  /** Level 1: top / bottom halves. Level 2: left / right halves. */
  heartLabelA: string;
  heartLabelB: string;
  questions: string[];
  actions: string[];
  prayer: string;
  /** 3rd-section activity. Absent on legacy sheets: they render the heart from the heart* fields. */
  activity?: SheetActivity;
};

const line = (max: number) => z.string().trim().max(max);

/** DB-free so scripts and the static sheet data can validate without Prisma. */
export const gospelSheetLevelSchema = z.object({
  title: line(80).min(1, "Title is required"),
  story: line(1200).min(1, "Story is required"),
  keyLine: line(120).min(1, "Key line is required"),
  heartTitle: line(60).min(1),
  heartIntro: line(300),
  heartLabelA: line(40).min(1),
  heartLabelB: line(40).min(1),
  questions: z.array(line(120)).length(2),
  actions: z.array(line(60)).length(3),
  prayer: line(200),
  activity: sheetActivitySchema.optional(),
});

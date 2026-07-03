import type { LessonBlockType } from "@prisma/client";
import { z } from "zod";

const baseConfig = z
  .object({
    gameSlug: z.string().optional(),
    wordIds: z.array(z.string()).optional(),
    wordPreset: z.string().optional(),
    readingKind: z.string().optional(),
    maxChars: z.number().int().positive().optional(),
    bookSlug: z.string().optional(),
    chapter: z.number().int().positive().optional(),
    resourceSlug: z.string().optional(),
    html: z.string().optional(),
    familyInclude: z.boolean().optional(),
  })
  .passthrough();

export const lessonBlockInputSchema = z.object({
  sortOrder: z.number().int().min(0),
  type: z.custom<LessonBlockType>(),
  label: z.string().nullable().optional(),
  config: baseConfig,
});

export const replaceLessonBlocksSchema = z.object({
  blocks: z.array(lessonBlockInputSchema).min(0),
});

export type LessonBlockInput = z.infer<typeof lessonBlockInputSchema>;

import type { LessonBlockType } from "@prisma/client";
import { z } from "zod";

const baseConfig = z
  .object({
    gameSlug: z.string().optional(),
    wordIds: z.array(z.string()).optional(),
    wordPreset: z.string().optional(),
    readingKind: z.string().optional(),
    maxChars: z.number().int().positive().optional(),
    minChars: z.number().int().min(0).optional(),
    bookSlug: z.string().optional(),
    chapter: z.number().int().positive().optional(),
    resourceSlug: z.string().optional(),
    html: z.string().optional(),
    familyInclude: z.boolean().optional(),
    url: z.string().optional(),
    buttonLabel: z.string().optional(),
    openInNewTab: z.boolean().optional(),
    prompt: z.string().optional(),
    placeholder: z.string().optional(),
    writingMode: z.enum(["display", "student"]).optional(),
    imageUrl: z.string().optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    imageSource: z.enum(["upload", "url"]).optional(),
    embedUrl: z.string().optional(),
    assetUrl: z.string().optional(),
    assetFilename: z.string().optional(),
    assetMimeType: z.string().optional(),
    slidesSource: z.enum(["embed", "upload"]).optional(),
    gameFormat: z.string().optional(),
    words: z.array(z.string()).optional(),
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

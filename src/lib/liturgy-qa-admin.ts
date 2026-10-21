import { isQaTopic } from "@/lib/liturgy-qa-topics";
import { isLiturgyCardLink } from "@/lib/liturgy-topics";
import { z } from "zod";

const hex = z
  .string()
  .trim()
  .regex(/^(#[0-9a-fA-F]{6})?$/, "Use a #RRGGBB colour");

const text = (max: number) => z.string().trim().max(max);

export const qaCardFields = {
  question: text(200).min(1, "Question is required"),
  answer: text(4000).min(1, "Answer is required"),
  tryThis: text(300),
  iconFallback: text(16),
  imageFilename: text(160).regex(/^[a-z0-9._-]*$/i, "Letters, numbers, dot, dash only"),
  imageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || isLiturgyCardLink(v), "Image must be a site path or an http(s) URL"),
  imageScene: text(1000),
  imagePrompt: text(3000),
  altText: text(400),
  cardColor: hex,
  status: z.enum(["DRAFT", "PUBLISHED"]),
  internalSourceRef: text(300),
  reviewNote: text(1000),
};

export const qaCardCreateSchema = z
  .object({
    topicSlug: z.string().refine(isQaTopic, "Unknown topic"),
    ...qaCardFields,
  })
  .strict();

export const qaCardUpdateSchema = z.object(qaCardFields).partial().strict();

export const qaTopicUpdateSchema = z
  .object({
    title: text(120).min(1),
    bigIdea: text(400),
    ageNote: text(160),
    accentColor: hex,
    cardBackColor: hex,
  })
  .partial()
  .strict();

export const qaMoveSchema = z.object({ direction: z.enum(["up", "down"]) }).strict();
export const qaBulkStatusSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) }).strict();

/** Admin APIs only accept JSON bodies (blocks simple cross-site form posts). */
export async function readJson(request: Request): Promise<unknown | null> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const ID_RE = /^[a-z0-9]{10,40}$/i;

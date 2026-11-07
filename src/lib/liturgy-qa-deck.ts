import { assembleQaDeck, type QaDeckSection } from "@/lib/liturgy-qa-catalog";
import { readPublishedQa } from "@/lib/liturgy-qa";
import { LITURGY_TOPICS, type LiturgyTopic } from "@/lib/liturgy-topics";

/** All ten liturgy Q&A sets: published rows when the database can be read, otherwise the shared catalog. */
export async function loadLiturgyQaDeck(): Promise<QaDeckSection[]> {
  const entries = await Promise.all(
    LITURGY_TOPICS.map(async (slug) => [slug, await readPublishedQa(slug)] as const),
  );
  const reads = Object.fromEntries(entries) as Partial<
    Record<LiturgyTopic, Awaited<ReturnType<typeof readPublishedQa>>>
  >;
  return assembleQaDeck(reads);
}

import { LITURGY_TOPIC_LABELS, LITURGY_TOPICS } from "@/lib/liturgy-topics";

/** Q&A flip-card topics: the ten liturgy pages plus the Prayers page. */
export const QA_TOPICS = [...LITURGY_TOPICS, "prayers"] as const;
export type QaTopic = (typeof QA_TOPICS)[number];

export const QA_TOPIC_LABELS: Record<QaTopic, string> = { ...LITURGY_TOPIC_LABELS, prayers: "Prayers" };

export function isQaTopic(value: string): value is QaTopic {
  return (QA_TOPICS as readonly string[]).includes(value);
}

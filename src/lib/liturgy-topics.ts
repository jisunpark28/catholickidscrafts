export const LITURGY_TOPICS = [
  "mass",
  "sacraments",
  "saints",
  "devotions",
  "ordinary-time",
  "advent",
  "christmas-time",
  "lent",
  "paschal-triduum",
  "easter-time",
] as const;

export type LiturgyTopic = (typeof LITURGY_TOPICS)[number];

export const LITURGY_TOPIC_LABELS: Record<LiturgyTopic, string> = {
  mass: "Mass",
  sacraments: "Sacraments",
  saints: "Saints",
  devotions: "Devotions",
  "ordinary-time": "Ordinary Time",
  advent: "Advent",
  "christmas-time": "Christmas Time",
  lent: "Lent",
  "paschal-triduum": "Paschal Triduum",
  "easter-time": "Easter Time",
};

export function isLiturgyTopic(value: string): value is LiturgyTopic {
  return (LITURGY_TOPICS as readonly string[]).includes(value);
}

/** Site path or http(s) URL. Matches links the public grid already opens. */
export function isLiturgyCardLink(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

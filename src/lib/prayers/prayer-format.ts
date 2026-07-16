/** Insert a line break after commas, semicolons, and periods for easier reading aloud. */
export function formatPrayerLineBreaks(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .replace(/([,;.])\s*/g, "$1\n")
        .replace(/\n+$/g, "")
        .trim(),
    )
    .filter(Boolean)
    .join("\n\n");
}

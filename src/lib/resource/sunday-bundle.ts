// This Sunday bundle helpers: header line + the Plus bundle print path (sheet + picture card).
import { keyToSlug } from "@/lib/resource/sheets";

/** Plus print view: sheet + card. Save as PDF from the dialog. */
export function bundlePrintPath(key: string, level: 1 | 2): string {
  const p = new URLSearchParams();
  if (level === 2) p.set("level", "2");
  p.set("autoprint", "1");
  return `/print/resource/bundle/${keyToSlug(key)}?${p.toString()}`;
}

export function fullSundayDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function seasonIcon(season: string): string {
  const s = season.toLowerCase();
  if (s.includes("solemn") || s.includes("feast")) return "👑";
  if (s.includes("advent")) return "🕯️";
  if (s.includes("christmas")) return "⭐";
  if (s.includes("lent")) return "✝️";
  if (s.includes("easter")) return "🌅";
  return "🌿";
}

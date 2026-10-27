import { keyToSlug } from "@/lib/resource/sheets";

export function resourceEditPath(key: string, level?: 1 | 2, customId?: string | null): string {
  const p = new URLSearchParams();
  if (level === 2) p.set("level", "2");
  if (customId) p.set("id", customId);
  const qs = p.toString();
  return `/resource/edit/${keyToSlug(key)}${qs ? `?${qs}` : ""}`;
}

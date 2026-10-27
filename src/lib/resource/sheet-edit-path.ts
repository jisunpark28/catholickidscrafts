import { keyToSlug } from "@/lib/resource/sheets";

export function resourceEditPath(key: string, level?: 1 | 2): string {
  return `/resource/edit/${keyToSlug(key)}${level === 2 ? "?level=2" : ""}`;
}

import { getBibleBookCatalogEntry } from "@/lib/bible/chapter-notes/catalog";

/** Book slug for `/bible/[book]` and `/bible/read/[book]/[chapter]`, when it is a canon book. */
export function testamentBookSlugFromPath(pathname: string): string | null {
  const chapter = pathname.match(/^\/bible\/read\/([^/]+)\/\d+(?:\/|$)/);
  const book = pathname.match(/^\/bible\/([^/]+)$/);
  const slug = chapter?.[1] ?? book?.[1] ?? null;
  if (!slug || !getBibleBookCatalogEntry(slug)) return null;
  return slug;
}

export function isTestamentChromePath(pathname: string): boolean {
  return testamentBookSlugFromPath(pathname) != null;
}

export function testamentNavLabel(pathname: string): "Old Testament" | "New Testament" | null {
  const slug = testamentBookSlugFromPath(pathname);
  if (!slug) return null;
  const entry = getBibleBookCatalogEntry(slug);
  if (!entry) return null;
  return entry.testament === "OT" ? "Old Testament" : "New Testament";
}

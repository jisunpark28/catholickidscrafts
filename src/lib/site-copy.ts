import { SITE_COPY_DEFAULTS } from "../../prisma/data/site-copy-defaults";
import type { SiteCopyMap } from "@/lib/site-copy-types";
import { prisma } from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

const defaultMap = (): SiteCopyMap => {
  const map: SiteCopyMap = {};
  for (const row of SITE_COPY_DEFAULTS) {
    map[row.key] = row.value;
  }
  return map;
};

/** Cache tag for the published SiteCopy rows; admin saves call revalidateTag(SITE_COPY_TAG). */
export const SITE_COPY_TAG = "site-copy";

/**
 * Published DB overrides, shared across requests and instances (Next data cache).
 * Throws when the DB is unreachable so a failed read is never cached.
 */
const loadPublishedRows = unstable_cache(
  async (): Promise<Array<{ key: string; value: string }>> =>
    prisma.siteCopy.findMany({
      where: { published: true },
      select: { key: true, value: true },
    }),
  ["site-copy-published"],
  { tags: [SITE_COPY_TAG], revalidate: 3600 },
);

/** Defaults merged with published DB overrides. `force` skips the cache (fresh DB read). */
export async function getSiteCopyMap(force = false): Promise<SiteCopyMap> {
  const merged = defaultMap();
  try {
    const rows = force
      ? await prisma.siteCopy.findMany({ where: { published: true }, select: { key: true, value: true } })
      : await loadPublishedRows();
    for (const row of rows) {
      merged[row.key] = row.value;
    }
  } catch {
    // DB unavailable (e.g. at build time): defaults only, not cached
  }
  return merged;
}

/** Call after any SiteCopy write (route handlers / server actions only). */
export function invalidateSiteCopyCache() {
  revalidateTag(SITE_COPY_TAG);
}

export async function getSiteCopy(keys: string[]): Promise<SiteCopyMap> {
  const all = await getSiteCopyMap();
  const out: SiteCopyMap = {};
  for (const key of keys) {
    if (all[key] !== undefined) out[key] = all[key]!;
  }
  return out;
}

export function copyText(map: SiteCopyMap, key: string, fallback = ""): string {
  return map[key] ?? fallback;
}

/** Keys for a group id (e.g. `game_tiny_priest` → prefix `game.tiny_priest.`). */
export function groupKeyPrefix(groupId: string): string {
  return groupId.replace(/_/g, ".") + ".";
}

export async function getSiteCopyByGroup(groupId: string): Promise<SiteCopyMap> {
  const prefix = groupKeyPrefix(groupId);
  const all = await getSiteCopyMap();
  const out: SiteCopyMap = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(prefix)) {
      out[key.slice(prefix.length)] = value;
    }
  }
  return out;
}

export async function getSiteCopyByPrefix(prefix: string): Promise<SiteCopyMap> {
  const all = await getSiteCopyMap();
  const out: SiteCopyMap = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(prefix)) {
      out[key] = value;
    }
  }
  return out;
}

import { SITE_COPY_DEFAULTS } from "../../prisma/data/site-copy-defaults";
import type { SiteCopyMap } from "@/lib/site-copy-types";
import { prisma } from "@/lib/prisma";

const defaultMap = (): SiteCopyMap => {
  const map: SiteCopyMap = {};
  for (const row of SITE_COPY_DEFAULTS) {
    map[row.key] = row.value;
  }
  return map;
};

let cachedMap: SiteCopyMap | null = null;
let cacheTime = 0;
const CACHE_MS = 30_000;

export async function getSiteCopyMap(force = false): Promise<SiteCopyMap> {
  const now = Date.now();
  if (!force && cachedMap && now - cacheTime < CACHE_MS) {
    return cachedMap;
  }

  const merged = defaultMap();
  try {
    const rows = await prisma.siteCopy.findMany({
      where: { published: true },
    });
    for (const row of rows) {
      merged[row.key] = row.value;
    }
  } catch {
    // DB unavailable at build time — defaults only
  }

  cachedMap = merged;
  cacheTime = now;
  return merged;
}

export function invalidateSiteCopyCache() {
  cachedMap = null;
  cacheTime = 0;
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

import {
  lessonGameFormat,
  lessonPictureMatchPairs,
} from "@/lib/lesson-kit/game-block";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

const KIT_PREFIX = "lesson-offline:";
const CACHE_NAME = "ckc-lesson-games-v1";

export function lessonOfflineStorageKey(shareSlug: string): string {
  return `${KIT_PREFIX}${shareSlug}`;
}

export function saveLessonKitOffline(kit: LessonKitDto): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(lessonOfflineStorageKey(kit.shareSlug), JSON.stringify(kit));
  } catch {
    /* quota */
  }
}

export function loadLessonKitOffline(shareSlug: string): LessonKitDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lessonOfflineStorageKey(shareSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LessonKitDto;
    if (!parsed?.shareSlug || !Array.isArray(parsed.blocks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function listOfflineLessonShareSlugs(): string[] {
  if (typeof window === "undefined") return [];
  const slugs: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KIT_PREFIX)) continue;
      slugs.push(key.slice(KIT_PREFIX.length));
    }
  } catch {
    /* ignore */
  }
  return slugs;
}

function absoluteAssetUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) {
    return `${window.location.origin}${trimmed}`;
  }
  return null;
}

/** URLs to warm in Cache Storage so GAME / PLAY_GAME steps work after a prior online visit. */
export function collectLessonGamePrecacheUrls(kit: LessonKitDto): string[] {
  const urls = new Set<string>();

  for (const block of kit.blocks) {
    if (block.type === "PLAY_GAME" || block.type === "HANGMAN_WORDS") {
      const slug =
        block.type === "HANGMAN_WORDS"
          ? "hangman"
          : String(block.config.gameSlug ?? "liturgical-vestments");
      if (slug === "hangman") {
        urls.add("/games/hangman/index.html");
        urls.add("/games/hangman/catholic-words.js");
        urls.add("/api/hangman-words");
      }
    }

    if (block.type === "TYPING_WORDS") {
      urls.add("/api/typing-words");
    }

    if (block.type === "GAME") {
      const format = lessonGameFormat(block);
      if (format === "picture_match") {
        for (const pair of lessonPictureMatchPairs(block)) {
          const abs = absoluteAssetUrl(pair.imageUrl);
          if (abs) urls.add(abs);
        }
      }
    }

    if (block.type === "IMAGE") {
      const abs = absoluteAssetUrl(String(block.config.imageUrl ?? ""));
      if (abs) urls.add(abs);
    }
  }

  return [...urls];
}

export async function precacheLessonGameAssets(kit: LessonKitDto): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const urls = collectLessonGamePrecacheUrls(kit);
  if (urls.length === 0) return;

  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const existing = await cache.match(url);
        if (existing) return;
        const res = await fetch(url, { credentials: "same-origin" });
        if (res.ok) {
          await cache.put(url, res);
        }
      } catch {
        /* offline or CORS */
      }
    }),
  );
}

export async function fetchCachedLessonAsset(url: string): Promise<Response | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(url)) ?? null;
  } catch {
    return null;
  }
}

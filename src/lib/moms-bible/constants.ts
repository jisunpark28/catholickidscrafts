/**
 * Mom's Bible shared constants (client-safe: no Node or DB imports).
 * Storage keys (bookSlug / chapter / verse) are the site's internal ones; everything shown to
 * people uses official Catholic numbering through chapter-pages.ts.
 */

export const MB_COLORS = ["YELLOW", "GREEN", "BLUE", "PINK"] as const;
export type MbColorKey = (typeof MB_COLORS)[number];

export const MB_COLOR_INFO: Record<MbColorKey, { emoji: string; label: string; className: string }> = {
  YELLOW: { emoji: "🟡", label: "Love & Comfort", className: "mb-hl--yellow" },
  GREEN: { emoji: "🟢", label: "Wisdom & Growth", className: "mb-hl--green" },
  BLUE: { emoji: "🔵", label: "Courage & Peace", className: "mb-hl--blue" },
  PINK: { emoji: "🩷", label: "Mom's Prayer", className: "mb-hl--pink" },
};

/** Palette label with the writer's role ("Dad's Prayer"). */
export function colorLabel(c: MbColorKey, roleLabel = "Mom"): string {
  return c === "PINK" ? `${roleLabel || "Mom"}'s Prayer` : MB_COLOR_INFO[c].label;
}

/** Prayer Starter chips under the note box ({name} = the child's first name). */
export const PRAYER_STARTERS: Record<MbColorKey, readonly string[]> = {
  YELLOW: ["Lord, hold {name} close today…", "Thank you for comforting…", "Heal {their} sad heart…"],
  GREEN: ["Lord, give {name} wisdom to…", "Help {name} grow in…", "Thank you for teaching us…"],
  BLUE: ["Lord, make {name} brave when…", "Give {name} your peace tonight…", "Stay beside {name} at…"],
  PINK: ["Dear Jesus, bless {name}…", "I thank God for you because…", "My prayer for you is…"],
};

export function prayerStarters(color: MbColorKey | null, childName: string): string[] {
  const name = childName.trim().split(/\s+/)[0] || "my child";
  return PRAYER_STARTERS[color ?? "YELLOW"].map((t) => t.replace("{name}", name).replace("{their}", "their"));
}

export function isMbColor(v: unknown): v is MbColorKey {
  return typeof v === "string" && (MB_COLORS as readonly string[]).includes(v);
}

/** Child one-click stickers. `{role}` is the note author's label ("Mom", "Dad"). */
export const MB_STICKERS = {
  love: { emoji: "❤️", text: "Love you, {role}!" },
  prayed: { emoji: "🙏", text: "Amen!" },
  thanks: { emoji: "⭐", text: "I'll remember this!" },
} as const;
export type MbStickerKey = keyof typeof MB_STICKERS;

export function isMbSticker(v: unknown): v is MbStickerKey {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(MB_STICKERS, v);
}

export function stickerLabel(key: MbStickerKey, roleLabel: string): string {
  const s = MB_STICKERS[key];
  return `${s.emoji} ${s.text.replace("{role}", roleLabel || "Mom")}`;
}

export const MB_LIMITS = {
  parentText: 2000,
  childText: 200,
  roleLabel: 20,
  dedication: 500,
  /** Max siblings in one "Also send to" write. */
  alsoSendTo: 5,
  /** Max JSON request body. */
  bodyBytes: 8 * 1024,
} as const;

/** Role labels a parent can pick (free text up to 20 chars is also accepted server-side). */
export const MB_ROLE_CHOICES = ["Mom", "Dad", "Parent", "Grandma", "Grandpa", "Godparent"] as const;

/**
 * Book index stamps (one per chapter, the one that needs attention first).
 * - mine: a parent note not answered yet / only highlights (purple)
 * - waiting: something new to read (child: an unanswered note; parent: an unseen reply) (yellow)
 * - shared: notes answered (green)
 */
export type MbStamp = "mine" | "waiting" | "shared" | null;

export const MB_STAMP_INFO: Record<Exclude<MbStamp, null>, { emoji: string; label: string }> = {
  mine: { emoji: "🟣", label: "My Note" },
  waiting: { emoji: "🟡", label: "Waiting for You" },
  shared: { emoji: "🟢", label: "Shared Together" },
};

/** Cookie with the child a parent last picked in "Viewing Mia's Bible" (an id only; re-checked server-side). */
export const MB_CHILD_COOKIE = "ckc_mb_child";

/** Child header badge copy: chapters turned Shared Together (design section 5). */
export function formatSeedsLabel(seeds: number): string {
  const n = Math.max(0, Math.floor(Number.isFinite(seeds) ? seeds : 0));
  return `Shared Together: ${n} ${n === 1 ? "seed" : "seeds"}`;
}

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

export function isMbColor(v: unknown): v is MbColorKey {
  return typeof v === "string" && (MB_COLORS as readonly string[]).includes(v);
}

/** Child one-click stickers. `{role}` is the note author's label ("Mom", "Dad"). */
export const MB_STICKERS = {
  love: { emoji: "❤️", text: "Love you, {role}!" },
  prayed: { emoji: "🙏", text: "I prayed for this" },
  thanks: { emoji: "🌟", text: "Thank you, {role}!" },
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

export type MbStamp = "waiting" | "shared" | "highlights" | null;

export const MB_STAMP_INFO: Record<Exclude<MbStamp, null>, { emoji: string; label: string }> = {
  waiting: { emoji: "🟡", label: "Waiting for You" },
  shared: { emoji: "🟢", label: "Shared Together" },
  highlights: { emoji: "🟣", label: "Highlights" },
};

/** Cookie with the child a parent last picked in "Viewing Mia's Bible" (an id only; re-checked server-side). */
export const MB_CHILD_COOKIE = "ckc_mb_child";

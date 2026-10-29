import { z } from "zod";

const editFieldSchema = z.object({
  text: z.string().max(2000),
  fontFamily: z.string().max(80).optional(),
  fontSize: z.number().min(8).max(96).optional(),
  fill: z.string().max(40).optional(),
  fontWeight: z.string().max(20).optional(),
  fontStyle: z.string().max(20).optional(),
  underline: z.boolean().optional(),
});

const LOCAL_PHOTO_RE = /^\/uploads\/sheet-photos\/[\w-]+\/[\w.-]+\.(?:webp|jpe?g|png)$/i;
const LOCAL_PHOTO_FLAT_RE = /^\/uploads\/sheet-photos\/[\w.-]+\.(?:webp|jpe?g|png)$/i;

/** Only our own photo storage: local dev uploads or a Vercel Blob public URL under `sheet-photos/`. */
export function isAllowedSheetPhotoSrc(src: string): boolean {
  if (src.startsWith("/")) {
    if (src.includes("..")) return false;
    return LOCAL_PHOTO_RE.test(src) || LOCAL_PHOTO_FLAT_RE.test(src);
  }
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return false;
  }
  return (
    u.protocol === "https:" &&
    !u.username &&
    !u.password &&
    !u.port &&
    /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(u.hostname) &&
    u.pathname.startsWith("/sheet-photos/") &&
    !u.pathname.includes("..")
  );
}

/** Family id segment of a sheet photo URL (`sheet-photos/<familyId>/…`), if present. */
export function sheetPhotoFamilyId(src: string): string | null {
  let path = src;
  if (!src.startsWith("/")) {
    try {
      path = new URL(src).pathname;
    } catch {
      return null;
    }
  }
  const m = /\/sheet-photos\/([\w-]+)\//.exec(path);
  return m?.[1] ?? null;
}

const allowedImageSrc = z
  .string()
  .max(2048)
  .refine(isAllowedSheetPhotoSrc, "Image src must be a sheet photo upload URL");

const userObjectSchema = z.object({
  id: z.string().max(64),
  type: z.enum(["textbox", "sticker", "rect", "circle", "line", "ellipse", "image"]),
  left: z.number(),
  top: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  angle: z.number().optional(),
  text: z.string().max(2000).optional(),
  fontFamily: z.string().max(80).optional(),
  fontSize: z.number().optional(),
  fill: z.string().max(40).optional(),
  stroke: z.string().max(40).optional(),
  strokeWidth: z.number().optional(),
  /** Rounded corner radii (section boxes match `.gs-box`). */
  rx: z.number().min(0).max(200).optional(),
  ry: z.number().min(0).max(200).optional(),
  /** True when added via “Section box” (layer label). */
  section: z.boolean().optional(),
  /** Promoted from base HTML `.gs-box` (`bs_0` …). */
  baseSectionId: z.string().max(40).optional(),
  /** Promoted write-line / checkbox (`wl_0`, `chk_0`). */
  baseChromeId: z.string().max(40).optional(),
  chromeKind: z.enum(["writeline", "checkbox"]).optional(),
  stickerId: z.string().max(40).optional(),
  src: allowedImageSrc.optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const customSheetDataSchema = z.object({
  v: z.literal(1),
  base: z.object({
    key: z.string().max(40),
    level: z.union([z.literal(1), z.literal(2)]),
    paper: z.literal("letter"),
    rev: z.string().max(32),
  }),
  edits: z.record(z.string(), editFieldSchema).default({}),
  hidden: z.array(z.string().max(40)).default([]),
  /** Base section ids the user deleted (do not re-promote from HTML). */
  hiddenBaseSections: z.array(z.string().max(40)).default([]),
  objects: z.array(userObjectSchema).max(100).default([]),
});

export type CustomSheetData = z.infer<typeof customSheetDataSchema>;

export const CUSTOM_SHEET_MAX_JSON_BYTES = 200_000;

/**
 * Validate sheet JSON. Pass `familyAccountId` on writes so photo objects can only reference
 * that family's uploads (not another family's Blob URLs).
 */
export function parseCustomSheetData(
  raw: unknown,
  opts: { familyAccountId?: string } = {},
): CustomSheetData | string {
  const parsed = customSheetDataSchema.safeParse(raw);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid sheet data";
  if (opts.familyAccountId) {
    for (const o of parsed.data.objects) {
      if (!o.src) continue;
      const fam = sheetPhotoFamilyId(o.src);
      if (fam && fam !== opts.familyAccountId) return "Photo belongs to another account";
    }
  }
  const size = new TextEncoder().encode(JSON.stringify(parsed.data)).length;
  if (size > CUSTOM_SHEET_MAX_JSON_BYTES) return "Sheet data is too large (max 200KB)";
  // Keep core + dynamic field ids (auto_*, actTitle, …); drop empty keys
  const edits: CustomSheetData["edits"] = {};
  for (const [k, v] of Object.entries(parsed.data.edits)) {
    if (!/^[\w.-]{1,64}$/.test(k)) continue;
    edits[k] = v;
  }
  return { ...parsed.data, edits };
}

export const EDITOR_FONTS = [
  { id: "Andika", label: "Andika" },
  { id: "Comic Neue", label: "Comic Neue" },
  { id: "Fredoka", label: "Fredoka" },
  { id: "Baloo 2", label: "Baloo 2" },
  { id: "Nunito", label: "Nunito" },
  { id: "Patrick Hand", label: "Patrick Hand" },
  { id: "Caveat", label: "Caveat" },
  { id: "Atkinson Hyperlegible", label: "Atkinson Hyperlegible" },
] as const;

export type EditorFontId = (typeof EDITOR_FONTS)[number]["id"];

/** Faith + fun stickers (emoji drawn as Fabric text for MVP). */
export const EDITOR_STICKERS = [
  { id: "cross", emoji: "✝️", label: "Cross", group: "faith" as const },
  { id: "dove", emoji: "🕊️", label: "Dove", group: "faith" as const },
  { id: "church", emoji: "⛪", label: "Church", group: "faith" as const },
  { id: "pray", emoji: "🙏", label: "Pray", group: "faith" as const },
  { id: "bible", emoji: "📖", label: "Bible", group: "faith" as const },
  { id: "candle", emoji: "🕯️", label: "Candle", group: "faith" as const },
  { id: "angel", emoji: "😇", label: "Angel", group: "faith" as const },
  { id: "star", emoji: "⭐", label: "Star", group: "fun" as const },
  { id: "heart", emoji: "❤️", label: "Heart", group: "fun" as const },
  { id: "rainbow", emoji: "🌈", label: "Rainbow", group: "fun" as const },
  { id: "flower", emoji: "🌸", label: "Flower", group: "fun" as const },
  { id: "sheep", emoji: "🐑", label: "Sheep", group: "fun" as const },
  { id: "fish", emoji: "🐟", label: "Fish", group: "fun" as const },
  { id: "sun", emoji: "☀️", label: "Sun", group: "fun" as const },
] as const;

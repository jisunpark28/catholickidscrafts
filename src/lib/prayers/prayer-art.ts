// Phrase pictures for the /prayers carousel: public/prayers/<prayer-slug>/<NN>.webp (NN = 2-digit phrase
// number). Line slides use ONLY listed phrase art (or another prayer's phrase via `img`). Never cards/covers.
// cover.webp is for grid/cover slides only (cover: true). Missing phrase art → cream placeholder.
import { cardThumbSrc } from "@/lib/resource/card-meta";
import type { CarouselPrayer, PrayerPhrase } from "@/lib/prayers/prayer-phrases";

export const PRAYER_ART: Readonly<Record<string, { phrases: readonly number[]; cover?: boolean }>> = {
  "sign-of-the-cross": { phrases: [1, 2, 3, 4] },
  "glory-be": { phrases: [1, 2, 3, 4, 5, 6] },
  "hail-mary": { phrases: [1, 2, 3, 4, 5, 6, 7, 8] },
  "our-father": { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  "apostles-creed": { phrases: [2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  "act-of-contrition": { phrases: [1, 2, 3, 4, 5, 6, 8] },
  angelus: { phrases: [4, 5, 8, 11, 12, 15] },
  "anima-christi": { phrases: [1, 2, 3, 4, 6, 7, 8, 11] },
  "come-holy-spirit": { phrases: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  confiteor: { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13], cover: true },
  "eternal-rest": { phrases: [1, 2, 3, 4] },
  "fatima-prayer": { phrases: [1, 3, 4, 5] },
  "grace-after-meals": { phrases: [1, 3, 4, 5, 6] },
  "grace-before-meals": { phrases: [1, 2, 3, 4, 5, 6] },
  "guardian-angel": { phrases: [1, 2, 3, 4, 5, 6, 7] },
  "hail-holy-queen": { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11] },
  "holy-water-prayer": { phrases: [1, 2, 3, 4, 5], cover: true },
  memorare: { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13] },
  "morning-offering": { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  "nicene-creed": { phrases: [1, 4, 6, 7, 8, 9, 10, 11, 13, 14, 24, 25, 26, 27, 29], cover: true },
  "prayer-after-communion": { phrases: [1, 2, 3, 4, 5], cover: true },
  "prayer-before-communion": { phrases: [1, 2, 3, 4], cover: true },
  "prayer-of-st-francis": { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], cover: true },
  "prayer-to-st-michael": { phrases: [1, 2, 3, 5, 6, 7, 8] },
  "regina-caeli": { phrases: [1, 4, 5, 6, 7, 8, 9] },
  "sub-tuum": { phrases: [1, 2, 3, 4] },
};

/** QA-only /prayers tiles (no carousel) that ship a local cover.webp. */
export const QA_PRAYER_COVERS: Readonly<Record<string, string>> = {
  "act of reflection": "/prayers/act-of-reflection/cover.webp",
  "ten commandments": "/prayers/ten-commandments/cover.webp",
  "a night prayer": "/prayers/night-prayer/cover.webp",
  "night prayer": "/prayers/night-prayer/cover.webp",
  "my night prayer": "/prayers/night-prayer/cover.webp",
};

export function qaPrayerCoverSrc(question: string): string | null {
  const key = question.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
  return QA_PRAYER_COVERS[key] ?? null;
}

const nn = (n: number) => String(n).padStart(2, "0");

export function prayerPhraseArt(slug: string, n: number): string | null {
  return PRAYER_ART[slug]?.phrases.includes(n) ? `/prayers/${slug}/${nn(n)}.webp` : null;
}

/** The prayer's cover: its own cover.webp, else the site card picture (or the live card image), else null. */
export function prayerCoverSrc(p: CarouselPrayer, liveImage?: string | null): string | null {
  if (PRAYER_ART[p.slug]?.cover) return `/prayers/${p.slug}/cover.webp`;
  if (p.cover) return cardThumbSrc(p.cover);
  return liveImage || null;
}

/**
 * Picture for one phrase (line) slide — illustrations only.
 * Never uses cover.webp, PRY/site cards, or live grid uploads (those stay on cover/grid).
 * Missing art → null (cream placeholder) until a /prayers/<slug>/<NN>.webp is listed in PRAYER_ART.
 */
export function phraseImageSrc(p: CarouselPrayer, ph: PrayerPhrase, _liveImage?: string | null): string | null {
  const own = prayerPhraseArt(p.slug, ph.n);
  if (own) return own;
  if (ph.img) {
    const [slug, num] = ph.img.split("/");
    const other = slug && num ? prayerPhraseArt(slug, Number(num)) : null;
    if (other) return other;
  }
  return null;
}

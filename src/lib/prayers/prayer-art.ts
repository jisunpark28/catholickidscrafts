// Phrase pictures for the /prayers carousel: public/prayers/<prayer-slug>/<NN>.webp (NN = 2-digit phrase
// number) and cover.webp. List a file here when it is committed; anything not listed falls back (another
// phrase's picture, a site card, the prayer's cover card, or a cream placeholder) without a 404 request.
import { cardThumbSrc } from "@/lib/resource/card-meta";
import type { CarouselPrayer, PrayerPhrase } from "@/lib/prayers/prayer-phrases";

export const PRAYER_ART: Readonly<Record<string, { phrases: readonly number[]; cover?: boolean }>> = {
  "sign-of-the-cross": { phrases: [1, 2, 3, 4] },
  "glory-be": { phrases: [1, 2, 3, 4, 5, 6] },
  "hail-mary": { phrases: [1, 2, 3, 4, 5, 6, 7, 8] },
  "our-father": { phrases: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

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

/** Picture for one phrase slide, or null for the cream placeholder. */
export function phraseImageSrc(p: CarouselPrayer, ph: PrayerPhrase, liveImage?: string | null): string | null {
  const own = prayerPhraseArt(p.slug, ph.n);
  if (own) return own;
  if (ph.img) {
    const [slug, num] = ph.img.split("/");
    const other = slug && num ? prayerPhraseArt(slug, Number(num)) : null;
    if (other) return other;
  }
  if (ph.card) return cardThumbSrc(ph.card);
  return prayerCoverSrc(p, liveImage);
}

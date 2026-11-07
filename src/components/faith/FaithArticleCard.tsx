import { FAITH_HUB, type SeoCard } from "@/lib/seo/card-seo";
import Image from "next/image";
import Link from "next/link";

const COLLECTION_ART: Record<string, string> = {
  Prayer: "/home-features/prayers.webp",
  "Virtue & Life": "/home-features/curriculum.webp",
  "Mass & Church": "/home-features/liturgy.webp",
  Sacrament: "/home-features/liturgy.webp",
};

/** Existing public collection art. Not a Plus printable preview. */
export function faithCollectionImage(category: string): string {
  return COLLECTION_ART[category] ?? "/home-features/liturgy.webp";
}

export function FaithArticleCard({ card }: { card: SeoCard }) {
  const image = faithCollectionImage(card.cat);
  return (
    <Link
      href={`${FAITH_HUB}/${card.slug}`}
      data-faith-article={card.slug}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e6d9c5] bg-[#fffdf8] no-underline shadow-[0_10px_24px_-18px_rgba(120,70,20,0.45)] transition hover:border-[#c9773a]"
    >
      <span className="relative block aspect-[2/1] bg-[#f4eddf]">
        <Image
          src={image}
          alt={`${card.cat} collection illustration`}
          fill
          sizes="(max-width: 640px) 90vw, 320px"
          className="object-contain"
        />
      </span>
      <span className="flex flex-1 flex-col gap-2 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#9a6b3f]">
          {card.cat}
          {card.set ? ` · ${card.set}` : ""}
        </span>
        <span className="font-[Georgia,serif] text-lg font-bold leading-snug text-[#405329]">{card.title}</span>
        <span className="text-sm leading-relaxed text-[#4b5563]">{card.text}</span>
      </span>
    </Link>
  );
}

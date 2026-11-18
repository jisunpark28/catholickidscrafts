"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import { ADVENT_PACK_DATES, ADVENT_PACK_PATH } from "@/lib/advent-complete-2026";
import Link from "next/link";

/**
 * Home Advent Pack teaser. Session is client-only so the ISR home page stays static.
 * Desktop: sits beside the Sunday sheet. Mobile: order-first so it stays visible.
 */
export function AdventPackPromoCard() {
  const { ready, session, paidPlus } = useSiteSession();
  const isPlus = paidPlus || Boolean(session.family?.isPlus && !session.family.childMode);

  const ctaClassName =
    "inline-flex shrink-0 items-center justify-center rounded-full bg-[#d35400] px-4 py-2.5 text-center text-sm font-extrabold text-white no-underline hover:bg-[#b8470a]";

  return (
    <section
      aria-labelledby="home-advent-pack-title"
      className="rounded-[26px] border border-[#eadccd] bg-gradient-to-br from-[#fff1e2] via-[#fdfaf7] to-[#fdfaf7] px-5 py-[18px] shadow-[0_14px_32px_-18px_rgba(211,84,0,0.35)]"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d35400]">
        2026 Advent Pack · {ADVENT_PACK_DATES}
      </p>

      <div className="mt-1.5 flex items-center justify-between gap-3">
        <h2
          id="home-advent-pack-title"
          className="min-w-0 text-2xl font-bold leading-tight tracking-tight text-[#1f2937] sm:text-3xl"
        >
          Advent Pack
        </h2>

        {!ready ? (
          <div className="h-10 w-36 shrink-0 animate-pulse rounded-full bg-[#f3e6d8]" aria-hidden />
        ) : (
          <Link href={ADVENT_PACK_PATH} className={ctaClassName}>
            {isPlus ? "Open pack" : "Unlock with Plus"}
          </Link>
        )}
      </div>
    </section>
  );
}

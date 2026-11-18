"use client";

import { useSiteSession } from "@/components/SiteSessionProvider";
import { ADVENT_PACK_DATES, ADVENT_PACK_PATH } from "@/lib/advent-complete-2026";
import Link from "next/link";

/**
 * Home Advent Complete teaser. Session is client-only so the ISR home page stays static.
 * Desktop: sits beside the Sunday sheet. Mobile: order-first so it stays visible.
 */
export function AdventPackPromoCard() {
  const { ready, session, paidPlus } = useSiteSession();
  const isPlus = paidPlus || Boolean(session.family?.isPlus && !session.family.childMode);

  return (
    <section
      aria-labelledby="home-advent-pack-title"
      className="rounded-[26px] border border-[#eadccd] bg-gradient-to-br from-[#fff1e2] via-[#fdfaf7] to-[#fdfaf7] px-5 py-[18px] shadow-[0_14px_32px_-18px_rgba(211,84,0,0.35)]"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d35400]">
        2026 Advent Pack · {ADVENT_PACK_DATES}
      </p>
      <h2 id="home-advent-pack-title" className="mt-1.5 text-xl font-bold leading-snug text-[#1f2937]">
        Advent Complete
      </h2>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {["8 Gospel sheets", "5 crafts"].map((label) => (
          <li
            key={label}
            className="rounded-full border border-[#eadccd] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6b4a2e]"
          >
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {!ready ? (
          <div className="h-11 w-40 animate-pulse rounded-full bg-[#f3e6d8]" aria-hidden />
        ) : isPlus ? (
          <Link
            href={ADVENT_PACK_PATH}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#d35400] px-4 py-3 text-center text-sm font-extrabold text-white no-underline hover:bg-[#b8470a] sm:w-auto"
          >
            Open pack
          </Link>
        ) : (
          <Link
            href={ADVENT_PACK_PATH}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#d35400] px-4 py-3 text-center text-sm font-extrabold text-white no-underline hover:bg-[#b8470a] sm:w-auto"
          >
            Unlock with Plus
          </Link>
        )}
      </div>
    </section>
  );
}

"use client";

import { HomeHubAccountMenu } from "@/components/HomeHubAccountMenu";
import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { Branch, Cross, Heart, Sparkle, Star } from "@/components/home/HomeBackdrop";
import type { HeaderSessionResponse } from "@/lib/header-session";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

type Props = {
  initialSession: HeaderSessionResponse;
};

/**
 * Soft decorations that live only in the empty gaps between logo, search and account,
 * so they never overlap them. Hidden from assistive tech and non-interactive.
 */
function DecorGap({ side }: { side: "left" | "right" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none relative h-12 min-w-0 select-none overflow-hidden sm:h-14">
      {side === "left" ? (
        <>
          <Heart className="absolute left-[18%] top-1 h-3 w-3 opacity-80" />
          <Sparkle className="absolute left-[55%] top-[55%] h-2.5 w-2.5" color="#c9c7a0" />
          <Star className="absolute left-[30%] bottom-0.5 hidden h-3 w-3 md:block" />
          <Branch className="absolute right-[12%] top-0 hidden h-8 w-7 rotate-[-30deg] xl:block" />
        </>
      ) : (
        <>
          <Sparkle className="absolute left-[20%] top-1 h-3 w-3" color="#e9c46a" />
          <Star className="absolute left-[48%] bottom-0.5 hidden h-3.5 w-3.5 md:block" />
          <Cross className="absolute right-[18%] top-0.5 h-6 w-4 rotate-12" />
          <Branch className="absolute right-[48%] top-0 hidden h-7 w-6 rotate-[25deg] xl:block" />
          <Heart className="absolute right-[6%] bottom-1 hidden h-3 w-3 opacity-80 sm:block" />
        </>
      )}
    </div>
  );
}

/** Jisun's header logo image (lamb + wordmark), used as-is. Source is 869x287 px, transparent PNG. */
function Wordmark() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]"
    >
      <Image
        src="/header-logo.png"
        width={869}
        height={287}
        alt="Catholic Kids Crafts"
        priority
        unoptimized
        className="h-11 w-auto sm:h-14"
      />
    </Link>
  );
}

export function HomeHubHeader({ initialSession }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const pathname = usePathname() ?? "";
  const searchResultsSlotId = useId();
  const mobileSearchId = useId();
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => setMobileSearch(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8dccf] bg-[#f7eee3]">
      <div className="relative w-full px-3 py-2.5 sm:px-6 sm:py-3 lg:px-10">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[auto_minmax(1.5rem,1fr)_minmax(0,36rem)_minmax(1.5rem,1fr)_auto] sm:gap-3">
          <Wordmark />
          <DecorGap side="left" />

          {/* Search: full pill from sm up; an icon on phones that opens it below. */}
          <div className="hidden min-w-0 justify-center sm:flex">
            <HomeLearnSearch
              variant="header"
              className="w-full max-w-xl"
              headerResultsSlotId={searchResultsSlotId}
            />
          </div>

          <div className="hidden sm:block">
            <DecorGap side="right" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMobileSearch((v) => !v)}
              aria-expanded={mobileSearch}
              aria-controls={mobileSearchId}
              aria-label={mobileSearch ? "Close search" : "Search"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7f9a5a] text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] sm:hidden"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {mobileSearch ? (
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                ) : (
                  <>
                    <circle cx="8.5" cy="8.5" r="5.25" />
                    <path d="M12.5 12.5 17 17" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
            <HomeHubAccountMenu initialSession={initialSession} signInLabel={t("global.nav.sign_in", "Sign in")} />
          </div>
        </div>

        {mobileSearch ? (
          <div id={mobileSearchId} className="mt-2 sm:hidden">
            <HomeLearnSearch variant="header" className="w-full" headerResultsSlotId={searchResultsSlotId} autoFocus />
          </div>
        ) : null}

        <div id={searchResultsSlotId} className="pointer-events-none mx-auto max-w-xl [&>*]:pointer-events-auto" />
      </div>
    </header>
  );
}

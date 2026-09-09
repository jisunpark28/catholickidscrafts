"use client";

import { HomeHubAccountMenu } from "@/components/HomeHubAccountMenu";
import { HomeHubMenuButton } from "@/components/HomeHubButton";
import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { SiteLogo } from "@/components/SiteLogo";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { PUBLIC_EXPLORE_NAV } from "@/lib/public-explore-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  initialSession: HeaderSessionResponse;
};

function navLinkClass(active: boolean): string {
  return `rounded-lg px-2 py-1 text-sm font-semibold transition hover:text-[var(--color-accent)] ${
    active ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
  }`;
}

export function HomeHubHeader({ initialSession }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const pathname = usePathname() ?? "";
  const searchResultsSlotId = useId();
  const exploreMenuId = useId();
  const exploreRef = useRef<HTMLDivElement>(null);
  const [exploreOpen, setExploreOpen] = useState(false);

  const exploreNav = PUBLIC_EXPLORE_NAV.map((item) => ({
    href: item.href,
    label: t(item.labelKey, item.fallback),
  }));

  useEffect(() => {
    setExploreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!exploreOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!exploreRef.current?.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [exploreOpen]);

  function isActive(href: string): boolean {
    if (href === "/play") return pathname === "/play" || pathname.startsWith("/play/");
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8dccf] bg-[#f5ebe0]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-8 lg:px-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <div className="col-start-1 row-start-1 flex min-w-0 justify-start">
            <HomeLearnSearch
              variant="header"
              className="w-full max-w-[10.5rem] sm:max-w-xs"
              headerResultsSlotId={searchResultsSlotId}
            />
          </div>

          <div className="col-start-2 row-start-1 flex shrink-0 justify-center scale-[0.94] sm:scale-100">
            <SiteLogo size="header" showWordmark={false} linkToHome />
          </div>

          <div className="col-start-3 row-start-1 flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            <div ref={exploreRef} className="relative md:hidden">
              <HomeHubMenuButton
                onClick={() => setExploreOpen((v) => !v)}
                ariaExpanded={exploreOpen}
                ariaControls={exploreMenuId}
              >
                {t("global.nav.explore", "Explore")}
              </HomeHubMenuButton>
              {exploreOpen && (
                <nav
                  id={exploreMenuId}
                  aria-label="Explore"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[12rem] rounded-2xl border border-[#e8e0d6] bg-white/95 py-2 pl-3 pr-3 shadow-lg backdrop-blur-sm"
                >
                  <ul>
                    {exploreNav.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setExploreOpen(false)}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className="block rounded-lg px-2 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[#fdfaf7] hover:text-[var(--color-accent)]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>

            <HomeHubAccountMenu
              initialSession={initialSession}
              signInLabel={t("global.nav.sign_in", "Sign in")}
            />
          </div>

          <div
            id={searchResultsSlotId}
            className="pointer-events-none col-span-3 row-start-2 [&>*]:pointer-events-auto"
          />
        </div>

        <nav
          className="mt-2 hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 md:flex"
          aria-label="Explore"
        >
          {exploreNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={navLinkClass(isActive(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

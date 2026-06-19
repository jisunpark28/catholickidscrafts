"use client";

import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { SiteLogo } from "@/components/SiteLogo";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function HomeHubHeader() {
  const pathname = usePathname() ?? "";
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { href: "/mass", label: t("global.nav.mass", "Daily Mass") },
    { href: "/play", label: t("global.nav.play", "Play") },
    { href: "/curriculum", label: t("global.nav.curriculum", "Curriculum") },
    { href: "/resources", label: t("global.nav.resources", "Kids Resources") },
    {
      href: "/recommendations",
      label: t("global.nav.recommendations", "Recommendations"),
    },
    { href: "/account/login", label: "Family account" },
    { href: "/reader/login", label: "Reader sign-in" },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8d0bc] bg-[#f5d4b8]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-8 lg:px-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 justify-start">
            <HomeLearnSearch variant="header" className="w-full max-w-[11rem] sm:max-w-xs" />
          </div>

          <div className="flex justify-center px-1">
            <SiteLogo size="header" showWordmark={false} className="scale-90 sm:scale-100" />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-[2rem] border border-[#e8d0bc] bg-[#fdf8f4] px-5 py-2.5 text-xs font-bold tracking-wide text-[var(--color-ink)] shadow-sm transition hover:bg-white sm:px-6 sm:py-3 sm:text-sm"
              aria-expanded={menuOpen}
              aria-controls="home-hub-menu"
            >
              MENU
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="home-hub-menu"
            className="mt-3 rounded-2xl border border-[#e8d0bc] bg-[#fdf8f4] px-4 py-3 shadow-sm"
          >
            <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

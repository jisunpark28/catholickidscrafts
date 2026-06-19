"use client";

import { HomeLearnSearch } from "@/components/HomeLearnSearch";
import { HomeHubMenuButton } from "@/components/HomeHubButton";
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
    <header className="sticky top-0 z-50 border-b border-[#e8dccf] bg-[#f5ebe0]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-8 lg:px-12">
        <div className="relative flex min-h-[3.25rem] items-center justify-between gap-3">
          <div className="z-10 flex min-w-0 flex-1 justify-start">
            <HomeLearnSearch
              variant="header"
              className="w-full max-w-[10.5rem] sm:max-w-xs"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto scale-[0.88] sm:scale-100">
              <SiteLogo size="header" showWordmark={false} />
            </div>
          </div>

          <div className="z-10 flex flex-1 justify-end">
            <HomeHubMenuButton onClick={() => setMenuOpen((v) => !v)} ariaExpanded={menuOpen}>
              Menu
            </HomeHubMenuButton>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="home-hub-menu"
            className="mt-3 rounded-2xl border border-[#e8e0d6] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm"
          >
            <ul className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-1 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
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

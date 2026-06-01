"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/SiteLogo";

const nav = [
  { href: "/mass", label: "Daily Mass", match: (p: string) => p === "/mass" || p.startsWith("/mass/") },
  { href: "/play", label: "Play", match: (p: string) => p.startsWith("/play") },
  { href: "/curriculum", label: "Curriculum", match: (p: string) => p.startsWith("/curriculum") },
  { href: "/resources", label: "Kids Resources", match: (p: string) => p.startsWith("/resources") },
  { href: "/recommendations", label: "Recommendations", match: (p: string) => p.startsWith("/recommendations") },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-8 lg:px-12">
        <SiteLogo size="header" showWordmark={false} />
        <nav className="flex flex-wrap items-center justify-end gap-4 sm:gap-6 lg:gap-8">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-1 text-xs font-semibold transition sm:text-sm lg:text-base ${
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

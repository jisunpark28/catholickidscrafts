"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/SiteLogo";

const nav = [
  { href: "/mass", label: "Daily Mass", match: (p: string) => p === "/mass" || p.startsWith("/mass/") },
  { href: "/curriculum", label: "Curriculum", match: (p: string) => p.startsWith("/curriculum") },
  { href: "/resources", label: "Kids Resources", match: (p: string) => p.startsWith("/resources") },
  { href: "/recommendations", label: "Recommendations", match: (p: string) => p.startsWith("/recommendations") },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-8 px-4 py-3 sm:px-8 lg:px-12">
        <SiteLogo size="header" showWordmark={false} />
        <nav className="flex items-center gap-6 sm:gap-10">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-1 text-sm font-semibold transition sm:text-base ${
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

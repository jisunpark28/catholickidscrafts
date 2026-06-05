"use client";

import { useCopy } from "@/components/SiteCopyProvider";
import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";
import { MASS_DATA_SOURCE } from "@/lib/mass-source";
import { getTptStoreUrl } from "@/lib/tpt";

export function SiteFooter() {
  const c = useCopy;
  const tptStore = getTptStoreUrl();

  const explore = [
    { href: "/mass", label: c("global.footer.link.mass", "Daily Mass") },
    { href: "/play", label: c("global.footer.link.play", "Play & Learn") },
    { href: "/resources", label: c("global.footer.link.resources", "Kids Resources") },
    { href: "/curriculum", label: c("global.footer.link.curriculum", "Curriculum") },
    { href: "/recommendations", label: c("global.footer.link.recommendations", "Recommendations") },
  ];

  const legal = [
    { href: "/about", label: c("global.footer.link.about", "About") },
    { href: "/privacy", label: c("global.footer.link.privacy", "Privacy") },
    { href: "/affiliate-disclosure", label: c("global.footer.link.affiliate", "Affiliate disclosure") },
  ];

  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex gap-4">
            <Image
              src={logo}
              alt=""
              className="h-20 w-auto object-contain"
              style={{ height: "80px", width: "auto" }}
            />
            <div>
              <p className="font-bold text-[var(--color-ink)]">
                {c("global.site.name", "Catholic Kids Crafts")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
                {c("global.footer.tagline", "")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-10 text-sm font-semibold">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                {c("global.footer.explore_heading", "Explore")}
              </p>
              <ul className="space-y-2">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-[var(--color-link)] hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                {c("global.footer.legal_heading", "Shop & legal")}
              </p>
              <ul className="space-y-2">
                {tptStore && (
                  <li>
                    <a
                      href={tptStore}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-link)] hover:underline"
                    >
                      {c("global.footer.tpt_link", "Teachers Pay Teachers ↗")}
                    </a>
                  </li>
                )}
                {legal.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-[var(--color-link)] hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          {MASS_DATA_SOURCE} · © {new Date().getFullYear()} {c("global.site.name", "Catholic Kids Crafts")} ·{" "}
          {c("global.footer.disclosure", "Some links may earn a commission (see")}{" "}
          <Link href="/affiliate-disclosure" className="underline">
            {c("global.footer.disclosure_link", "disclosure")}
          </Link>
          ).
        </p>
      </div>
    </footer>
  );
}

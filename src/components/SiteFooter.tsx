"use client";

import Link from "next/link";
import { SITE_LITURGY_FOOTER } from "@/lib/site-liturgy-footer";

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
];

/** Ultra-minimal site footer: brand, legal links, sources and copyright. */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Extra bottom padding keeps the floating Feedback button clear of the footer text. */}
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-10 sm:px-8 sm:pb-16 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-bold text-[var(--color-ink)]">Catholic Kids Crafts</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
              Simplified lesson planning for children&apos;s ministry, based on the Church calendar.
            </p>
          </div>
          <nav aria-label="Legal">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Legal</p>
            <ul className="space-y-2 text-sm font-semibold">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[var(--color-link)] hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          <p>{SITE_LITURGY_FOOTER}</p>
          <p className="mt-2">© 2026 Catholic Kids Crafts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

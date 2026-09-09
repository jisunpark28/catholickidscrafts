"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";
import { PUBLIC_EXPLORE_NAV } from "@/lib/public-explore-nav";
import { getPublicContactMailto } from "@/lib/site-contact";
import { SITE_LITURGY_FOOTER } from "@/lib/site-liturgy-footer";
import { getTptStoreUrl } from "@/lib/tpt";

export function SiteFooter() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
  const tptStore = getTptStoreUrl();
  const contactMailto = getPublicContactMailto();

  const explore = [
    ...PUBLIC_EXPLORE_NAV.map((item) => ({
      href: item.href,
      label: t(item.labelKey, item.fallback),
    })),
    {
      href: "/recommendations",
      label: t("global.footer.link.recommendations", "Recommendations"),
    },
  ];

  const legal = [
    { href: "/about", label: t("global.footer.link.about", "About") },
    { href: "/privacy", label: t("global.footer.link.privacy", "Privacy") },
    { href: "/terms", label: t("global.footer.link.terms", "Terms") },
    { href: "/affiliate-disclosure", label: t("global.footer.link.affiliate", "Affiliate disclosure") },
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
                {t("global.site.name", "Catholic Kids Crafts")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
                {t("global.footer.tagline", "")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-10 text-sm font-semibold">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                {t("global.footer.explore_heading", "Explore")}
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
                {t("global.footer.legal_heading", "Shop & legal")}
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
                      {t("global.footer.tpt_link", "Teachers Pay Teachers ↗")}
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
                <li>
                  {contactMailto ? (
                    <a href={contactMailto} className="text-[var(--color-link)] hover:underline">
                      {t("global.footer.link.contact", "Contact")}
                    </a>
                  ) : (
                    <Link href="/privacy" className="text-[var(--color-link)] hover:underline">
                      {t("global.footer.link.contact", "Contact")}
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          {SITE_LITURGY_FOOTER} · © {new Date().getFullYear()}{" "}
          {t("global.site.name", "Catholic Kids Crafts")} ·{" "}
          {t("global.footer.disclosure", "Some links may earn a commission (see")}{" "}
          <Link href="/affiliate-disclosure" className="underline">
            {t("global.footer.disclosure_link", "disclosure")}
          </Link>
          ).
        </p>
      </div>
    </footer>
  );
}

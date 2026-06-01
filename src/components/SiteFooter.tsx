import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";
import { MASS_DATA_SOURCE } from "@/lib/evangelizo";
import { getTptStoreUrl } from "@/lib/tpt";

const explore = [
  { href: "/mass", label: "Daily Mass" },
  { href: "/resources", label: "Kids Resources" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/recommendations", label: "Recommendations" },
];

const legal = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
];

export function SiteFooter() {
  const tptStore = getTptStoreUrl();

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
              <p className="font-bold text-[var(--color-ink)]">Catholic Kids Crafts</p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
                Daily Mass in English and seasonal resources for Catholic families and Sunday
                school.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-10 text-sm font-semibold">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Explore
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
                Shop & legal
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
                      Teachers Pay Teachers ↗
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
          {MASS_DATA_SOURCE} · © {new Date().getFullYear()} Catholic Kids Crafts · Some links may
          earn a commission (see{" "}
          <Link href="/affiliate-disclosure" className="underline">
            disclosure
          </Link>
          ).
        </p>
      </div>
    </footer>
  );
}

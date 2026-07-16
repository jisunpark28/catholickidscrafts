"use client";

import {
  getDefaultPrayer,
  getPrayerBySlug,
  prayersByCategory,
  sortedPrayerCategories,
  type CatholicPrayer,
} from "@/lib/prayers/catholic-prayers";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function PrayersReader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugParam = searchParams.get("p")?.trim() ?? "";

  const active: CatholicPrayer = useMemo(() => {
    if (slugParam) {
      const found = getPrayerBySlug(slugParam);
      if (found) return found;
    }
    return getDefaultPrayer();
  }, [slugParam]);

  const selectPrayer = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("p", slug);
      router.replace(`/prayers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const categories = sortedPrayerCategories();

  return (
    <div className="prayers-reader">
      <nav className="prayers-reader__sidebar" aria-label="Prayer list">
        {categories.map((category) => {
          const prayers = prayersByCategory(category.id);
          if (prayers.length === 0) return null;
          return (
            <div key={category.id} className="prayers-reader__group">
              <h2 className="prayers-reader__group-title">{category.label}</h2>
              <ul className="prayers-reader__list">
                {prayers.map((prayer) => {
                  const isActive = prayer.slug === active.slug;
                  return (
                    <li key={prayer.slug}>
                      <button
                        type="button"
                        className={`prayers-reader__item${isActive ? " prayers-reader__item--active" : ""}`}
                        onClick={() => selectPrayer(prayer.slug)}
                        aria-current={isActive ? "true" : undefined}
                      >
                        {prayer.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <article className="prayers-reader__panel" aria-labelledby="prayer-title">
        <header className="prayers-reader__panel-head">
          <h2 id="prayer-title" className="prayers-reader__title">
            {active.title}
          </h2>
          {active.subtitle ? (
            <p className="prayers-reader__subtitle">{active.subtitle}</p>
          ) : null}
        </header>
        <div className="prayers-reader__body">
          <div className="prayers-reader__text">{active.text.trim()}</div>
        </div>
      </article>

      <p className="prayers-reader__mobile-hint text-sm text-[var(--color-muted)] lg:hidden">
        Tap a prayer name above to read it here.
      </p>

      <p className="mt-8 text-sm text-[var(--color-muted)]">
        <Link href="/" className="font-semibold text-[var(--color-link)]">
          ← Home
        </Link>
      </p>
    </div>
  );
}

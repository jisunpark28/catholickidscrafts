"use client";

import {
  getDefaultLocalizedPrayer,
  getLocalizedPrayer,
  localizedPrayersByCategory,
  sortedLocalizedCategoryIds,
} from "@/lib/prayers/resolve-prayer";
import { formatPrayerLineBreaks } from "@/lib/prayers/prayer-format";
import {
  PRAYER_LANGUAGES,
  isPrayerLanguageCode,
  normalizePrayerLanguage,
  type PrayerLanguageCode,
} from "@/lib/prayers/prayer-languages";
import type { LocalizedPrayer } from "@/lib/prayers/prayer-types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const PRAYER_LANG_STORAGE_KEY = "prayer-lang";

export function PrayersReader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugParam = searchParams.get("p")?.trim() ?? "";
  const langParam = searchParams.get("lang");
  const language = normalizePrayerLanguage(langParam);

  useEffect(() => {
    if (langParam) return;
    try {
      const stored = window.localStorage.getItem(PRAYER_LANG_STORAGE_KEY);
      if (!stored || !isPrayerLanguageCode(stored)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", stored);
      router.replace(`/prayers?${params.toString()}`, { scroll: false });
    } catch {
      /* ignore */
    }
  }, [langParam, router, searchParams]);

  const active: LocalizedPrayer = useMemo(() => {
    if (slugParam) {
      const found = getLocalizedPrayer(slugParam, language);
      if (found) return found;
    }
    return getDefaultLocalizedPrayer(language);
  }, [slugParam, language]);

  const displayText = useMemo(
    () => formatPrayerLineBreaks(active.text),
    [active.text],
  );

  const selectPrayer = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("p", slug);
      router.replace(`/prayers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const selectLanguage = useCallback(
    (code: PrayerLanguageCode) => {
      try {
        window.localStorage.setItem(PRAYER_LANG_STORAGE_KEY, code);
      } catch {
        /* ignore */
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", code);
      router.replace(`/prayers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const categories = sortedLocalizedCategoryIds(language);

  return (
    <div className="prayers-reader">
      <div className="prayers-reader__lang-bar">
        <label htmlFor="prayer-language" className="prayers-reader__lang-label">
          Language
        </label>
        <select
          id="prayer-language"
          className="prayers-reader__lang-select"
          value={language}
          onChange={(e) => selectLanguage(normalizePrayerLanguage(e.target.value))}
        >
          {PRAYER_LANGUAGES.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div className="prayers-reader__mobile-picker lg:hidden">
        <label htmlFor="prayer-picker" className="prayers-reader__picker-label">
          Prayer
        </label>
        <select
          id="prayer-picker"
          className="prayers-reader__prayer-select"
          value={active.slug}
          onChange={(e) => selectPrayer(e.target.value)}
        >
          {categories.map((category) => {
            const prayers = localizedPrayersByCategory(category.id, language);
            if (prayers.length === 0) return null;
            return (
              <optgroup key={category.id} label={category.label}>
                {prayers.map((prayer) => (
                  <option key={prayer.slug} value={prayer.slug}>
                    {prayer.title}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <nav className="prayers-reader__sidebar hidden lg:block" aria-label="Prayer list">
        {categories.map((category) => {
          const prayers = localizedPrayersByCategory(category.id, language);
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
          <div className="prayers-reader__text" lang={language}>
            {displayText}
          </div>
        </div>
      </article>

      <p className="mt-8 text-sm text-[var(--color-muted)] lg:col-span-2">
        <Link href="/" className="font-semibold text-[var(--color-link)]">
          ← Home
        </Link>
      </p>
    </div>
  );
}

"use client";

import { BibleChapterTyping } from "@/components/BibleChapterTyping";
import { bibleUiLabels } from "@/lib/bible/bible-ui-labels";
import {
  catholicChapterHeading,
  getCatholicBookName,
} from "@/lib/bible/catholic-book-names";
import { readBibleUiLanguage, writeBibleUiLanguage } from "@/lib/bible/chapter-notes";
import {
  PRAYER_LANGUAGES,
  isPrayerLanguageCode,
  normalizePrayerLanguage,
  type PrayerLanguageCode,
} from "@/lib/prayers/prayer-languages";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Props = {
  bookSlug: string;
  apiBookName: string;
  chapter: number;
  citation: string;
  text: string;
  discussionSignedIn: boolean;
  discussionReaderLabel: string;
};

export function BibleChapterReadClient({
  bookSlug,
  apiBookName,
  chapter,
  citation,
  text,
  discussionSignedIn,
  discussionReaderLabel,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const langParam = searchParams.get("lang");
  const language = normalizePrayerLanguage(langParam);
  const [uiLanguage, setUiLanguage] = useState<PrayerLanguageCode>(language);
  const labels = bibleUiLabels(uiLanguage);
  const localizedBookName = getCatholicBookName(bookSlug, uiLanguage, apiBookName);
  const heading = catholicChapterHeading(bookSlug, chapter, uiLanguage, apiBookName);

  useEffect(() => {
    setUiLanguage(language);
  }, [language]);

  useEffect(() => {
    if (langParam) return;
    try {
      const stored = readBibleUiLanguage();
      if (!isPrayerLanguageCode(stored)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", stored);
      router.replace(`/bible/read/${bookSlug}/${chapter}?${params.toString()}`, {
        scroll: false,
      });
    } catch {
      /* ignore */
    }
  }, [bookSlug, chapter, langParam, router, searchParams]);

  const selectLanguage = useCallback(
    (code: PrayerLanguageCode) => {
      setUiLanguage(code);
      writeBibleUiLanguage(code);
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", code);
      router.replace(`/bible/read/${bookSlug}/${chapter}?${params.toString()}`, {
        scroll: false,
      });
    },
    [bookSlug, chapter, router, searchParams],
  );

  return (
    <div className="space-y-4">
      <div className="bible-read__lang-bar flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
        <label htmlFor="bible-language" className="text-xs font-semibold text-[var(--color-muted)]">
          {labels.language}
        </label>
        <select
          id="bible-language"
          className="min-w-[10rem] rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm text-[var(--color-ink)]"
          value={uiLanguage}
          onChange={(e) => selectLanguage(normalizePrayerLanguage(e.target.value))}
        >
          {PRAYER_LANGUAGES.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.nativeName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)] sm:text-2xl">{heading}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{citation}</p>
        {uiLanguage !== "en" && localizedBookName !== apiBookName && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">{apiBookName}</p>
        )}
      </div>

      <BibleChapterTyping
        bookSlug={bookSlug}
        bookName={localizedBookName}
        apiBookName={apiBookName}
        chapter={chapter}
        text={text}
        uiLanguage={uiLanguage}
        discussionSignedIn={discussionSignedIn}
        discussionReaderLabel={discussionReaderLabel}
      />
    </div>
  );
}

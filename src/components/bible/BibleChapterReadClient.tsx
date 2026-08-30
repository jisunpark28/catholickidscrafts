"use client";

import { BibleChapterTyping } from "@/components/BibleChapterTyping";
import {
  catholicChapterHeading,
  getCatholicBookName,
} from "@/lib/bible/catholic-book-names";
import { readBibleUiLanguage, writeBibleUiLanguage } from "@/lib/bible/chapter-notes";
import {
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
        onUiLanguageChange={selectLanguage}
        discussionSignedIn={discussionSignedIn}
        discussionReaderLabel={discussionReaderLabel}
      />
    </div>
  );
}

"use client";

import { BibleChapterDiscussion } from "@/components/bible/BibleChapterDiscussion";
import { BibleChapterReadingNotes } from "@/components/bible/BibleChapterReadingNotes";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { bibleUiLabels } from "@/lib/bible/bible-ui-labels";
import type { ChapterNoteLocale } from "@/lib/bible/chapter-notes";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { typingDraftKey } from "@/lib/typing-draft-keys";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  bookSlug: string;
  bookName: string;
  apiBookName: string;
  chapter: number;
  text: string;
  uiLanguage: ChapterNoteLocale;
  discussionSignedIn: boolean;
  discussionReaderLabel: string;
};

export function BibleChapterTyping({
  bookSlug,
  bookName,
  apiBookName,
  chapter,
  text,
  uiLanguage,
  discussionSignedIn,
  discussionReaderLabel,
}: Props) {
  const [stickerError, setStickerError] = useState("");
  const labels = bibleUiLabels(uiLanguage);

  const unlockSticker = useCallback(
    async (accuracy: number) => {
      setStickerError("");
      const res = await fetch("/api/bible/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug,
          chapter,
          typingAccuracy: accuracy,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const message = data.error ?? "Could not save sticker";
        setStickerError(message);
        throw new Error(message);
      }
    },
    [bookSlug, chapter],
  );

  return (
    <div className="space-y-4">
      <BibleChapterReadingNotes
        bookSlug={bookSlug}
        apiBookName={apiBookName}
        chapter={chapter}
        locale={uiLanguage}
      />
      <PassageTypingGame
        text={text}
        title={`${bookName} — ${labels.chapter} ${chapter}`}
        draftKey={typingDraftKey.bibleChapter(bookSlug, chapter)}
        accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
        onStickerUnlock={unlockSticker}
        hideInstructions
        hideTitle
        appearance="bible"
        completionMessage={
          <p>
            {labels.stickerSaved(chapter, bookName)}{" "}
            <Link href={`/bible/${bookSlug}`} className="font-semibold text-[var(--color-link)]">
              {labels.backTo(bookName)}
            </Link>
          </p>
        }
      />
      {stickerError && <p className="mt-3 text-sm text-red-600">{stickerError}</p>}
      <BibleChapterDiscussion
        bookSlug={bookSlug}
        chapter={chapter}
        initialSignedIn={discussionSignedIn}
        initialReaderLabel={discussionReaderLabel}
      />
    </div>
  );
}

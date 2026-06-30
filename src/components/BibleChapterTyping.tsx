"use client";

import { BibleChapterDiscussion } from "@/components/bible/BibleChapterDiscussion";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { typingDraftKey } from "@/lib/typing-draft-keys";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  bookSlug: string;
  bookName: string;
  chapter: number;
  text: string;
  discussionSignedIn: boolean;
  discussionReaderLabel: string;
};

export function BibleChapterTyping({
  bookSlug,
  bookName,
  chapter,
  text,
  discussionSignedIn,
  discussionReaderLabel,
}: Props) {
  const [stickerError, setStickerError] = useState("");

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
      <PassageTypingGame
        text={text}
        title={`${bookName} — Chapter ${chapter}`}
        draftKey={typingDraftKey.bibleChapter(bookSlug, chapter)}
        accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
        onStickerUnlock={unlockSticker}
        hideInstructions
        appearance="gospel"
        completionMessage={
          <p>
            Your praise sticker for chapter {chapter} is saved.{" "}
            <Link href={`/bible/${bookSlug}`} className="font-semibold text-[var(--color-link)]">
              Back to {bookName}
            </Link>{" "}
            to see your collection.
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

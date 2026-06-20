"use client";

import { PassageTypingGame } from "@/components/PassageTypingGame";
import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  bookSlug: string;
  bookName: string;
  chapter: number;
  text: string;
  citation: string;
};

export function BibleChapterTyping({
  bookSlug,
  bookName,
  chapter,
  text,
  citation,
}: Props) {
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const onComplete = useCallback(
    async (accuracy: number) => {
      setSaveError("");
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
        setSaveError(data.error ?? "Could not save progress");
        return;
      }
      setSaved(true);
    },
    [bookSlug, chapter],
  );

  return (
    <div className="space-y-4">
      <PassageTypingGame
        text={text}
        title={`${bookName} — Chapter ${chapter}`}
        accuracyThreshold={BIBLE_STICKER_ACCURACY_THRESHOLD}
        onComplete={onComplete}
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
      {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
      {saved && !saveError && (
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {citation} · Douay-Rheims (public domain) via latinprayer.org
        </p>
      )}
    </div>
  );
}

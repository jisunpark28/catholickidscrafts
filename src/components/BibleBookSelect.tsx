"use client";

import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import { useRouter } from "next/navigation";

type Props = {
  books: BibleBookMeta[];
  currentSlug: string;
  /** When false, the control sits at the top right with no “Book” label. */
  showLabel?: boolean;
};

export function BibleBookSelect({ books, currentSlug, showLabel = true }: Props) {
  const router = useRouter();

  return (
    <label
      className={
        showLabel
          ? "mt-6 flex flex-col gap-2 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center"
          : "ml-auto block w-full max-w-xs text-sm"
      }
    >
      {showLabel ? <span className="font-semibold text-[var(--color-ink)]">Book</span> : null}
      <select
        value={currentSlug}
        aria-label="Book"
        onChange={(e) => router.push(`/bible/${e.target.value}`)}
        className={
          showLabel
            ? "w-full max-w-md border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--color-ink)] sm:flex-1"
            : "w-full rounded-md border border-[#e7e3de] bg-white px-3 py-2 text-sm text-[#1c1c1c]"
        }
      >
        {books.map((book) => (
          <option key={book.slug} value={book.slug}>
            {book.name} ({book.totalChapters} chapters)
          </option>
        ))}
      </select>
    </label>
  );
}

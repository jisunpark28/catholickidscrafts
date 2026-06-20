"use client";

import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import { useRouter } from "next/navigation";

type Props = {
  books: BibleBookMeta[];
  currentSlug: string;
  label?: string;
};

export function BibleBookSelect({ books, currentSlug, label = "Book" }: Props) {
  const router = useRouter();

  return (
    <label className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center">
      <span className="font-semibold text-[var(--color-ink)]">{label}</span>
      <select
        value={currentSlug}
        onChange={(e) => router.push(`/bible/${e.target.value}`)}
        className="w-full max-w-md border border-[var(--color-border)] bg-white px-3 py-2 text-[var(--color-ink)] sm:flex-1"
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

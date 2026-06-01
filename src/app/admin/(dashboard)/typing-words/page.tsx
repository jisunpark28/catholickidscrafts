import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminTypingWordsPage() {
  const items = await prisma.typingWord.findMany({
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Typing game words</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Falling words in Word mode on /play/typing.
          </p>
        </div>
        <Link
          href="/admin/typing-words/new"
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          + New word
        </Link>
      </div>

      <table className="mt-8 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
        <thead className="bg-[var(--color-surface)] text-left">
          <tr>
            <th className="border-b border-[var(--color-border)] p-3">Word</th>
            <th className="border-b border-[var(--color-border)] p-3">Hint</th>
            <th className="border-b border-[var(--color-border)] p-3">Status</th>
            <th className="border-b border-[var(--color-border)] p-3" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-[var(--color-muted)]">
                No words yet. Add saints, virtues, and church vocabulary.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-[var(--color-border)] p-3 font-medium">{item.word}</td>
                <td className="border-b border-[var(--color-border)] p-3 text-[var(--color-muted)]">
                  {item.hint || "—"}
                </td>
                <td className="border-b border-[var(--color-border)] p-3">
                  {item.published ? "Published" : "Draft"}
                </td>
                <td className="border-b border-[var(--color-border)] p-3 text-right">
                  <Link
                    href={`/admin/typing-words/${item.id}/edit`}
                    className="font-semibold text-[var(--color-link)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

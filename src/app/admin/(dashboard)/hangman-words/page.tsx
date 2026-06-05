import { PlayWordsManager } from "@/components/admin/PlayWordsManager";
import { HANGMAN_WORDS_ADMIN } from "@/lib/play-words-admin-config";
import { prisma } from "@/lib/prisma";

export default async function AdminHangmanWordsPage() {
  const items = await prisma.hangmanWord.findMany({
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hangman game words</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Secret words and hints for /play/hangman.
        </p>
      </div>

      <PlayWordsManager initialItems={items} config={HANGMAN_WORDS_ADMIN} />
    </div>
  );
}

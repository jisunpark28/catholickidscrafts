import { TypingWordsManager } from "@/components/admin/TypingWordsManager";
import { prisma } from "@/lib/prisma";

export default async function AdminTypingWordsPage() {
  const items = await prisma.typingWord.findMany({
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Typing game words</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Falling words in Word mode on /play/typing.
        </p>
      </div>

      <TypingWordsManager initialItems={items} />
    </div>
  );
}

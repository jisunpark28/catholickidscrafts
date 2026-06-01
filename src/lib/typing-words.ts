import { prisma } from "@/lib/prisma";

export type TypingWordItem = {
  id: string;
  word: string;
  hint: string;
  sortOrder: number;
};

function mapRow(r: {
  id: string;
  word: string;
  hint: string;
  sortOrder: number;
}): TypingWordItem {
  return {
    id: r.id,
    word: r.word.trim(),
    hint: r.hint.trim(),
    sortOrder: r.sortOrder,
  };
}

export async function getPublishedTypingWords(): Promise<TypingWordItem[]> {
  const rows = await prisma.typingWord.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });
  return rows.map(mapRow).filter((w) => w.word.length > 0);
}

import { prisma } from "@/lib/prisma";

export type HangmanWordItem = {
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
}): HangmanWordItem {
  return {
    id: r.id,
    word: r.word.trim(),
    hint: r.hint.trim(),
    sortOrder: r.sortOrder,
  };
}

export async function getPublishedHangmanWords(): Promise<HangmanWordItem[]> {
  const rows = await prisma.hangmanWord.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { word: "asc" }],
  });
  return rows.map(mapRow).filter((w) => w.word.length > 0);
}

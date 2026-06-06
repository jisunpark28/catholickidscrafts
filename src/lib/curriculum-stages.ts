import { prisma } from "@/lib/prisma";

/** Distinct Curriculum track `title` labels, in curriculum sort order. */
export async function getCurriculumTitleLabels(): Promise<string[]> {
  const rows = await prisma.curriculumTrack.findMany({
    select: { title: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  const seen = new Set<string>();
  const titles: string[] = [];
  for (const row of rows) {
    const label = row.title.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    titles.push(label);
  }
  return titles;
}

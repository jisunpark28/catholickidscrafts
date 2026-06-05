import { prisma } from "@/lib/prisma";

/** Distinct Curriculum `stage` labels, in curriculum sort order. */
export async function getCurriculumStageLabels(): Promise<string[]> {
  const rows = await prisma.curriculumTrack.findMany({
    select: { stage: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { stage: "asc" }],
  });

  const seen = new Set<string>();
  const stages: string[] = [];
  for (const row of rows) {
    const label = row.stage.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    stages.push(label);
  }
  return stages;
}

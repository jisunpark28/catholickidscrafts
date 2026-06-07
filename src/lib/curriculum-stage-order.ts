/** Numeric order for curriculum track `stage` labels (e.g. "Stage 1", "Overview"). */
export function curriculumStageOrder(stage: string): number {
  const match = stage.match(/(\d+)/);
  if (match) return Number.parseInt(match[1], 10);
  if (/overview/i.test(stage)) return 10_000;
  return 9_999;
}

export function compareCurriculumStages(a: string, b: string): number {
  const diff = curriculumStageOrder(a) - curriculumStageOrder(b);
  if (diff !== 0) return diff;
  return a.localeCompare(b);
}

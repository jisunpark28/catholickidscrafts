/** Operator placeholder titles/bodies that must not appear on public Curriculum. */
export function isPlaceholderLessonCopy(title: string, description: string): boolean {
  const t = title.trim().toLowerCase();
  const d = description.trim().toLowerCase();
  return t === "test" || d === "test";
}

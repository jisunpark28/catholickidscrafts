/** Plain-text blurb teachers can paste into email, Remind, or parish bulletins. */
export function lessonKitShareMessage(opts: {
  title: string;
  classroomUrl: string;
  homeUrl: string;
}): string {
  const { title, classroomUrl, homeUrl } = opts;
  return [
    `Lesson plan: ${title}`,
    "",
    `Run in class: ${classroomUrl}`,
    `At home (families): ${homeUrl}`,
  ].join("\n");
}

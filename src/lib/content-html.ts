/** True if stored body is TipTap/HTML, not legacy Markdown. */
export function isHtmlContent(content: string, format?: string): boolean {
  if (format === "html") return true;
  if (format === "markdown") return false;
  const t = content.trimStart();
  return t.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(t);
}

import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { getLessonPrintExportStyles } from "@/lib/lesson-kit/print-export-styles";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render print HTML at runtime (dynamic import avoids Next.js RSC bundler restrictions). */
export async function renderLessonKitPrintHtml(kit: LessonKitDto): Promise<string> {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { LessonPrintView } = await import("@/components/lesson/LessonPrintView");

  const body = renderToStaticMarkup(React.createElement(LessonPrintView, { kit }));
  const styles = getLessonPrintExportStyles();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(kit.title)}</title>
  <style>${styles}</style>
</head>
<body>${body}</body>
</html>`;
}

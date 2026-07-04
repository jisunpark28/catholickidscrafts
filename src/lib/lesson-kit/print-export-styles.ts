import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readCss(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

/** Inline styles for Puppeteer PDF export (matches PR-8 letter print). */
export function getLessonPrintExportStyles(): string {
  const printCss = readCss("src/styles/lesson-print.css");
  const kitCss = readCss("src/styles/lesson-kit.css");
  const globalsCss = readCss("src/app/globals.css");

  const richContent = extractRichContentRules(globalsCss);
  const imageFigure = extractBlock(kitCss, ".lesson-image-figure", ".lesson-slides-embed");

  return `
:root {
  --color-ink: #1a1a1a;
  --color-muted: #666666;
  --color-accent: #c45c26;
  --color-link: #1d4ed8;
  --color-border: #cccccc;
}

html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: #1a1a1a;
}

${printCss}

${imageFigure}

${richContent}
`.trim();
}

function extractRichContentRules(css: string): string {
  const rules: string[] = [];
  const re = /\.rich-content[^{]*\{[^}]*\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    rules.push(match[0]);
  }
  return rules.join("\n");
}

function extractBlock(css: string, startSelector: string, endBeforeSelector: string): string {
  const start = css.indexOf(startSelector);
  if (start < 0) return "";
  const end = css.indexOf(endBeforeSelector, start);
  return end > start ? css.slice(start, end).trim() : css.slice(start).trim();
}

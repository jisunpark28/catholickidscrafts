// Client-only: vector US Letter PDF of an edited activity sheet with jsPDF (already a dependency).
// Lines, dots and shapes become PDF paths; text uses the embedded Baloo 2 / Comic Relief fonts.
import type { jsPDF as JsPdf } from "jspdf";
import {
  ACTIVITY_FONTS,
  paintedStrokeWidth,
  scaleOf,
  transformedSegments,
  type ActivityDoc,
  type FontKey,
} from "@/lib/resource/activity-doc";

const fontCache = new Map<string, Promise<string>>();

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function loadFont(url: string): Promise<string> {
  let p = fontCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`font ${r.status}`);
        return r.arrayBuffer();
      })
      .then(toBase64);
    p.catch(() => fontCache.delete(url));
    fontCache.set(url, p);
  }
  return p;
}

const pdfFontName = (k: FontKey) => (k === "baloo" ? "CKCBaloo2" : "CKCComicRelief");

async function registerFonts(pdf: JsPdf, doc: ActivityDoc) {
  const needed = new Set<string>();
  for (const el of doc.elements) if (el.kind === "text") needed.add(`${el.fontFamily}:${el.fontWeight}`);
  await Promise.all(
    [...needed].map(async (key) => {
      const [family, w] = key.split(":") as [FontKey, string];
      const weight = Number(w) as 400 | 700;
      const data = await loadFont(ACTIVITY_FONTS[family].files[weight]);
      const file = `${pdfFontName(family)}-${weight}.ttf`;
      pdf.addFileToVFS(file, data);
      pdf.addFont(file, pdfFontName(family), weight === 700 ? "bold" : "normal");
    }),
  );
}

/** Builds the PDF (not saved yet). */
export async function buildActivityPdf(doc: ActivityDoc): Promise<JsPdf> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter", compress: true });
  pdf.setProperties({ title: doc.title, author: "Catholic Kids Crafts", subject: "catholickidscrafts.com" });
  await registerFonts(pdf, doc);

  for (const el of doc.elements) {
    const hasFill = el.fill !== "none";
    const hasStroke = el.stroke !== "none" && (el.strokeWidth ?? 1) > 0;
    if (el.kind === "text") {
      if (!el.text || !hasFill) continue;
      const t = scaleOf(el);
      pdf.setFont(pdfFontName(el.fontFamily), el.fontWeight === 700 ? "bold" : "normal");
      pdf.setFontSize(el.fontSize * Math.abs(t.sy));
      pdf.setTextColor(el.fill);
      const x = t.sx * el.x + t.tx;
      const y = t.sy * el.y + t.ty;
      const ratio = t.sy ? Math.abs(t.sx / t.sy) : 1;
      pdf.text(el.text, x, y, {
        align: el.anchor === "middle" ? "center" : el.anchor === "end" ? "right" : "left",
        baseline: "alphabetic",
        ...(Math.abs(ratio - 1) > 0.001 ? { horizontalScale: ratio } : {}),
      });
      continue;
    }
    if (!hasFill && !hasStroke) continue;
    if (hasFill) pdf.setFillColor(el.fill);
    if (hasStroke) {
      pdf.setDrawColor(el.stroke);
      pdf.setLineWidth(paintedStrokeWidth(el));
      pdf.setLineCap(el.lineCap ?? "butt");
      pdf.setLineJoin(el.lineJoin ?? "miter");
    }
    const segs = transformedSegments(el);
    pdf.path(
      segs.map((s) =>
        s.op === "h" ? { op: "h", c: [] } : { op: s.op, c: [...s.p] },
      ),
    );
    // Lines are never filled.
    if (hasFill && hasStroke && el.kind !== "line") pdf.fillStroke();
    else if (hasFill && el.kind !== "line") pdf.fill();
    else if (hasStroke) pdf.stroke();
    else pdf.discardPath();
  }
  return pdf;
}

export async function downloadActivityPdf(doc: ActivityDoc, filename: string): Promise<void> {
  const pdf = await buildActivityPdf(doc);
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

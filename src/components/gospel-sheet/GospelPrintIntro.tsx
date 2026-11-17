import Link from "next/link";

export type GospelPrintIntroProps = {
  /** Liturgical title only — no "(Year A)" suffix. */
  liturgicalName: string;
  gospelRef: string;
  /** Level-1 story / one-line Gospel summary for kids. */
  summary: string;
  /** SEO worksheet guide path, e.g. /sunday-mass-worksheets/... */
  guideHref: string;
};

/** Strip a trailing "(Year A|B|C)" if present so the title line stays year-free. */
export function liturgicalTitleForPrint(name: string): string {
  return name.replace(/\s*\(\s*Year\s*[ABC]\s*\)\s*$/i, "").trim();
}

/**
 * Screen-only intro above Sunday Gospel printables (hidden when printing).
 * Shared so every `/print/resource/...` Sunday sheet inherits the same header.
 */
export const GOSPEL_PRINT_INTRO_CSS = `
.gospel-print-intro {
  max-width: 816px;
  margin: 0 auto;
  padding: 18px 20px 12px;
  font-family: Georgia, "Times New Roman", serif;
  color: #1f2937;
  background: #fff8f0;
  border-bottom: 1px solid #f0d9b8;
}
.gospel-print-intro__brand {
  margin: 0 0 6px;
  text-align: center;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #6b4f2a;
}
.gospel-print-intro__title {
  margin: 0 0 10px;
  font-size: 1.35rem;
  line-height: 1.3;
}
.gospel-print-intro__gospel {
  margin: 0 0 12px;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
}
.gospel-print-intro__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.gospel-print-intro__links a {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border: 1px solid #c9ad7e;
  border-radius: 999px;
  background: #fff;
  color: #2a4a8a;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  box-shadow: 0 1px 0 rgba(51, 85, 153, 0.12);
}
.gospel-print-intro__links a:hover {
  background: #eef3fb;
  border-color: #335599;
  color: #1e3a6e;
}
.gospel-print-intro h2 {
  margin: 14px 0 6px;
  font-size: 1.05rem;
}
.gospel-print-intro__summary {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
}
@media print {
  .gospel-print-intro { display: none !important; }
}
`;

export function GospelPrintIntro({
  liturgicalName,
  gospelRef,
  summary,
  guideHref,
}: GospelPrintIntroProps) {
  const title = liturgicalTitleForPrint(liturgicalName);
  const links = [
    { href: guideHref, label: "Full worksheet guide" },
    { href: "/bible-verses-for-kids", label: "Bible verses for kids" },
    { href: "/moms-bible/situations", label: "Mom's Bible" },
  ] as const;

  return (
    <aside className="gospel-print-intro" aria-label="About this Sunday worksheet">
      <p className="gospel-print-intro__brand">Catholic kids Gospel worksheet</p>
      <h1 className="gospel-print-intro__title">{title}</h1>
      <div className="gospel-print-intro__gospel">
        <p style={{ margin: 0 }}>
          <strong>Gospel:</strong> {gospelRef}.
        </p>
        <ul className="gospel-print-intro__links">
          {links.map((link) => (
            <li key={link.label}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <h2>Gospel summary</h2>
      <p className="gospel-print-intro__summary">{summary}</p>
    </aside>
  );
}

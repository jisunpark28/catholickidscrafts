import type { GospelSheetView, SheetLevelNumber } from "@/lib/gospel-sheet";

const HEART =
  "M300 385 C 70 250 15 160 55 90 C 100 15 235 15 300 105 C 365 15 500 15 545 90 C 585 160 530 250 300 385 Z";

function Decorations() {
  return (
    <g className="ln" style={{ strokeWidth: 3 }}>
      <path d="M300 8v34 M286 20h28" />
      <path d="M40 330c-6-11-23-5-15 8l15 13 15-13c8-13-9-19-15-8z" />
      <path d="M560 330c-6-11-23-5-15 8l15 13 15-13c8-13-9-19-15-8z" />
      <path d="M45 30l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" />
      <path d="M555 30l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" />
      <path d="M120 365l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
      <path d="M480 365l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
    </g>
  );
}

function fit(label: string, base: number): number {
  if (label.length > 30) return base - 6;
  if (label.length > 22) return base - 2;
  return base;
}

function HeartTopBottom({ a, b, clipId }: { a: string; b: string; clipId: string }) {
  return (
    <svg viewBox="0 0 600 400" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={HEART} />
        </clipPath>
      </defs>
      <Decorations />
      <path className="ln" d={HEART} style={{ strokeWidth: 7 }} />
      <path
        className="ln"
        d="M0 200 q150 -14 300 0 t300 0"
        clipPath={`url(#${clipId})`}
        style={{ strokeWidth: 3, strokeDasharray: "10 8" }}
      />
      <text x="300" y="150" textAnchor="middle" fontSize={fit(a, 26)}>
        {a}
      </text>
      <text x="300" y="245" textAnchor="middle" fontSize={fit(b, 22)}>
        {b}
      </text>
    </svg>
  );
}

function HeartLeftRight({ a, b, clipId }: { a: string; b: string; clipId: string }) {
  const rows = [
    { n: "1.", y: 170, lx: 95 },
    { n: "2.", y: 225, lx: 120 },
    { n: "3.", y: 280, lx: 160 },
  ];
  return (
    <svg viewBox="0 0 600 400" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={HEART} />
        </clipPath>
      </defs>
      <Decorations />
      <path className="ln" d={HEART} style={{ strokeWidth: 7 }} />
      <path className="ln" d="M300 105V385" style={{ strokeWidth: 3 }} />
      <text x="185" y="100" textAnchor="middle" fontSize={fit(a, 22)}>
        {a}
      </text>
      <text x="190" y="128" textAnchor="middle" fontSize="13">
        3 ways I can…
      </text>
      <text x="415" y="100" textAnchor="middle" fontSize={fit(b, 22)}>
        {b}
      </text>
      <text x="410" y="128" textAnchor="middle" fontSize="13">
        3 ways I can…
      </text>
      {rows.map((r) => (
        <g key={r.n}>
          <text x={r.lx} y={r.y - 6} fontSize="18">
            {r.n}
          </text>
          <path
            className="ln"
            d={`M60 ${r.y}H290`}
            clipPath={`url(#${clipId})`}
            style={{ strokeWidth: 2, strokeDasharray: "3 6" }}
          />
          <text x="312" y={r.y - 6} fontSize="18">
            {r.n}
          </text>
          <path
            className="ln"
            d={`M310 ${r.y}H540`}
            clipPath={`url(#${clipId})`}
            style={{ strokeWidth: 2, strokeDasharray: "3 6" }}
          />
        </g>
      ))}
    </svg>
  );
}

/** One letter page of the Sunday Gospel sheet. */
export function GospelSheet({ sheet, level }: { sheet: GospelSheetView; level: SheetLevelNumber }) {
  const c = level === 1 ? sheet.levels.level1 : sheet.levels.level2;
  const clipId = `gs-heart-${sheet.slug}-${level}`;
  return (
    <div className={`gs gs-l${level}`}>
      <div className="gs-page">
        <header>
          <div>
            <h1>{c.title}</h1>
            <div className="gs-sub">
              {sheet.liturgicalName} · Level {level}
            </div>
          </div>
          <div className="gs-meta">
            <span className="gs-dot" style={{ background: sheet.dotColor }} />
            {sheet.sundayLabel}
            <br />
            {sheet.gospelRef}
          </div>
        </header>

        <div className="gs-box gs-story">
          <h2>Today&apos;s Story</h2>
          <p>{c.story}</p>
        </div>

        {level === 1 ? (
          <div className="gs-box">
            <h2>Trace the words</h2>
            <div className="gs-trace">{c.keyLine}</div>
            <div className="gs-trace">{c.keyLine}</div>
          </div>
        ) : (
          <div className="gs-box">
            <h2>Copy the key line</h2>
            <div className="gs-copy">{c.keyLine}</div>
            <div className="gs-wl" />
            <div className="gs-wl" />
          </div>
        )}

        <div className="gs-box gs-heart">
          <h2>{c.heartTitle}</h2>
          {c.heartIntro ? <div style={{ fontSize: level === 1 ? 15 : 13 }}>{c.heartIntro}</div> : null}
          {level === 1 ? (
            <HeartTopBottom a={c.heartLabelA} b={c.heartLabelB} clipId={clipId} />
          ) : (
            <HeartLeftRight a={c.heartLabelA} b={c.heartLabelB} clipId={clipId} />
          )}
        </div>

        <div className="gs-row">
          <div className="gs-box">
            <h2>{level === 1 ? "Let's talk" : "Think about it"}</h2>
            {c.questions.map((q, i) => (
              <div key={i}>
                <p className="gs-q">
                  {i + 1}. {q}
                </p>
                <div className="gs-wl" />
              </div>
            ))}
          </div>
          <div className="gs-box" style={level === 2 ? { flex: 0.7 } : undefined}>
            <h2>This week I will…</h2>
            <ul className="gs-chk">
              {c.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {c.prayer ? <div className="gs-prayer">&ldquo;{c.prayer}&rdquo;</div> : null}
        <footer>New free sheet every week at catholickidscrafts.com</footer>
      </div>
    </div>
  );
}

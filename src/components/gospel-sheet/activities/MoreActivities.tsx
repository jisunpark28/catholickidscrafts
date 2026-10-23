import type { CSSProperties, ReactNode } from "react";
import type { ActivityOf } from "@/lib/sheet-activities/schema";
import { generateColorGrid, generateCrossword, generateSudoku, rng, shuffle } from "@/lib/sheet-activities/generate";
import { SHAPE_POINTS, insidePolygon, toPath } from "@/lib/sheet-activities/shapes";
import { wrapLabel } from "./Heart";

type L = 1 | 2;
const fill: CSSProperties = { flex: 1, minHeight: 0 };
const Svg = ({ children, h = 330 }: { children: ReactNode; h?: number }) => (
  <svg viewBox={`0 0 600 ${h}`} style={fill} aria-hidden="true">
    {children}
  </svg>
);
const Lines = ({ n, gap = 30 }: { n: number; gap?: number }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", flex: 1 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="gs-act-fill" style={{ height: gap }} />
    ))}
  </div>
);

/* ---------- drawing ---------- */

export function SpeechActivity({ data, level }: { data: ActivityOf<"speech">; level: L }) {
  const n = data.characters.length;
  const w = 600 / n;
  return (
    <Svg>
      {data.characters.map((name, i) => {
        const cx = w * i + w / 2;
        const bw = Math.min(w - 20, 250);
        return (
          <g key={name} className="ln">
            <rect x={cx - bw / 2} y={10} width={bw} height={level === 1 ? 120 : 150} rx={30} style={{ strokeWidth: 3 }} />
            <path d={`M${cx - 10} ${level === 1 ? 130 : 160} L${cx} ${level === 1 ? 170 : 190} L${cx + 14} ${level === 1 ? 130 : 160}`} style={{ strokeWidth: 3, fill: "#fff" }} />
            {level === 2
              ? [55, 90, 125].map((y) => <path key={y} d={`M${cx - bw / 2 + 18} ${y}H${cx + bw / 2 - 18}`} style={{ strokeWidth: 1.5, strokeDasharray: "3 5" }} />)
              : null}
            <circle cx={cx} cy={230} r={32} style={{ strokeWidth: 2.5, strokeDasharray: "6 6" }} />
            <text x={cx} y={300} textAnchor="middle" fontSize={level === 1 ? 22 : 18} style={{ stroke: "none", fill: "#111" }}>
              {name}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

export function FacesActivity({ data, level }: { data: ActivityOf<"faces">; level: L }) {
  const n = data.people.length;
  const w = 600 / n;
  return (
    <Svg>
      {data.people.map((p, i) => {
        const cx = w * i + w / 2;
        return (
          <g key={p} className="ln">
            <circle cx={cx} cy={130} r={Math.min(95, w / 2 - 12)} style={{ strokeWidth: 3.5 }} />
            <circle cx={cx - 28} cy={110} r={5} fill="#111" />
            <circle cx={cx + 28} cy={110} r={5} fill="#111" />
            <text x={cx} y={270} textAnchor="middle" fontSize={20} style={{ stroke: "none", fill: "#111" }}>
              {p}
            </text>
            {level === 2 ? <path d={`M${cx - w / 2 + 20} 312H${cx + w / 2 - 20}`} style={{ strokeWidth: 1.5, strokeDasharray: "3 5" }} /> : null}
          </g>
        );
      })}
    </Svg>
  );
}

export function SymmetryActivity({ data, level, seed }: { data: ActivityOf<"symmetry">; level: L; seed: string }) {
  const id = `sym-${seed}`.replace(/[^a-zA-Z0-9-]/g, "");
  const d = toPath(SHAPE_POINTS[data.shape], 3.1, 145, 5);
  return (
    <Svg>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={300} height={330} />
        </clipPath>
      </defs>
      {level === 2
        ? Array.from({ length: 19 }, (_, i) => <path key={i} className="ln" d={`M${145 + i * 17.2} 5V315`} style={{ strokeWidth: 0.6, stroke: "#bbb" }} />)
        : null}
      <path className="ln" d={d} clipPath={`url(#${id})`} style={{ strokeWidth: 4 }} />
      {level === 1 ? <path className="ln" d={d} style={{ strokeWidth: 2, strokeDasharray: "2 9", stroke: "#999" }} /> : null}
      <path className="ln" d="M300 0V330" style={{ strokeWidth: 2, strokeDasharray: "10 6" }} />
    </Svg>
  );
}

export function ColorNumActivity({ data, level, seed }: { data: ActivityOf<"colornum">; level: L; seed: string }) {
  const cols = level === 1 ? 10 : 16;
  const rows = level === 1 ? 7 : 10;
  const grid = generateColorGrid((x, y) => insidePolygon(SHAPE_POINTS[data.shape], x, y), cols, rows, seed, data.mode);
  const cw = 310 / cols;
  const ch = 300 / rows;
  return (
    <Svg>
      {grid.map((row, r) =>
        row.map((v, c) => (
          <g key={`${r}-${c}`}>
            <rect className="ln" x={10 + c * cw} y={10 + r * ch} width={cw} height={ch} style={{ strokeWidth: 1 }} />
            <text x={10 + c * cw + cw / 2} y={10 + r * ch + ch / 2 + 5} textAnchor="middle" fontSize={level === 1 ? 15 : 11}>
              {v}
            </text>
          </g>
        )),
      )}
      <g fontSize={level === 1 ? 19 : 16}>
        {data.mode === "key" ? (
          <>
            <text x={345} y={130}>1 = your favourite color</text>
            <text x={345} y={180}>2 = leave white</text>
          </>
        ) : (
          <>
            <text x={345} y={120}>Color every EVEN number</text>
            <text x={345} y={150}>(2, 4, 6, 8).</text>
            <text x={345} y={190}>What picture appears?</text>
            <path className="ln" d="M345 240H575" style={{ strokeWidth: 1.5, strokeDasharray: "3 5" }} />
          </>
        )}
      </g>
    </Svg>
  );
}

export function SpotDiffActivity({ data, level, artFile }: { data: ActivityOf<"spotdiff">; level: L; artFile: string }) {
  return (
    <div className="gs-act-split" style={fill}>
      <div className="gs-ph" style={{ flex: 1 }}>{`${artFile} (A): ${data.scene}`}</div>
      <div className="gs-ph" style={{ flex: 1 }}>{`${artFile} (B): ${data.count} changes`}</div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, fontSize: level === 1 ? 18 : 15 }}>
        {Array.from({ length: data.count }, (_, i) => (
          <span key={i} className="gs-act-num" style={{ textAlign: "center", lineHeight: "24px" }}>
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- puzzles ---------- */

export function CrosswordActivity({ data, level }: { data: ActivityOf<"crossword">; level: L }) {
  const { rows, cols, placed } = generateCrossword(data.entries);
  const cell = Math.min(30, 300 / Math.max(rows, cols, 1));
  const cells = new Map<string, { num?: number; letter: string }>();
  for (const p of placed)
    for (let i = 0; i < p.word.length; i++) {
      const k = p.across ? `${p.row},${p.col + i}` : `${p.row + i},${p.col}`;
      const prev = cells.get(k);
      cells.set(k, { letter: p.word[i], num: i === 0 ? p.num : prev?.num });
    }
  return (
    <div className="gs-act-split" style={fill}>
      <svg viewBox={`0 0 ${cols * cell + 4} ${rows * cell + 4}`} style={{ flex: 1.2, minHeight: 0 }} aria-hidden="true">
        {[...cells].map(([k, v]) => {
          const [r, c] = k.split(",").map(Number);
          return (
            <g key={k}>
              <rect className="ln" x={2 + c * cell} y={2 + r * cell} width={cell} height={cell} style={{ strokeWidth: 1.5, fill: "#fff" }} />
              {v.num ? (
                <text x={4 + c * cell} y={12 + r * cell} fontSize={cell * 0.32}>
                  {v.num}
                </text>
              ) : null}
              {level === 1 && v.num ? (
                <text x={2 + c * cell + cell / 2} y={2 + r * cell + cell * 0.72} textAnchor="middle" fontSize={cell * 0.55} fill="#999">
                  {v.letter}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <ol className="gs-act-clues" style={{ fontSize: level === 1 ? 14 : 12.5 }}>
        {[...placed]
          .sort((a, b) => a.num - b.num)
          .map((p) => (
            <li key={p.word} value={p.num}>
              <b>{p.num}</b> {p.across ? "→" : "↓"} {p.clue} ({p.word.length})
            </li>
          ))}
      </ol>
    </div>
  );
}

export function SudokuActivity({ data, level, seed }: { data: ActivityOf<"sudoku">; level: L; seed: string }) {
  const { solution, shown } = generateSudoku(seed, level === 1 ? 4 : 9);
  const c = 66;
  return (
    <Svg>
      <g transform="translate(20 25)">
        {solution.map((row, r) =>
          row.map((v, k) => (
            <g key={`${r}-${k}`}>
              <rect className="ln" x={k * c} y={r * c} width={c} height={c} style={{ strokeWidth: 1.5 }} />
              {shown[r][k] ? (
                <text x={k * c + c / 2} y={r * c + c * 0.68} textAnchor="middle" fontSize={34}>
                  {data.symbols[v]}
                </text>
              ) : null}
            </g>
          )),
        )}
        <path className="ln" d={`M${2 * c} 0V${4 * c}M0 ${2 * c}H${4 * c}`} style={{ strokeWidth: 4 }} />
        <rect className="ln" x={0} y={0} width={4 * c} height={4 * c} style={{ strokeWidth: 4 }} />
      </g>
      <g fontSize={18}>
        {data.symbols.map((s, i) => (
          <text key={i} x={340} y={70 + i * 50}>
            {s} = {data.names[i]}
          </text>
        ))}
        <text x={340} y={290} fontSize={14}>
          Each row, column and box has all 4.
        </text>
      </g>
    </Svg>
  );
}

export function FixWordsActivity({ data, level }: { data: ActivityOf<"fixwords">; level: L }) {
  const parts = data.text.split(/(\{[^}]+\})/);
  const n = parts.filter((p) => p.startsWith("{")).length;
  return (
    <div className="gs-act-fb" style={fill}>
      <p style={{ fontSize: level === 1 ? 24 : 19, lineHeight: 1.6 }}>
        {parts.map((p, i) => (p.startsWith("{") ? <span key={i}>{p.slice(1, -1).split("|")[0]}</span> : <span key={i}>{p}</span>))}
      </p>
      <div className="gs-act-bank">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 6, alignItems: "flex-end" }}>
            ✗ <span className="gs-act-fill" style={{ width: 110, flex: "none" }} /> → ✓ <span className="gs-act-fill" style={{ width: 110, flex: "none" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function WordOrderActivity({ data, level, seed }: { data: ActivityOf<"wordorder">; level: L; seed: string }) {
  const pieces = shuffle(data.pieces, rng(`order:${seed}`));
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
      <div className="gs-act-bank" style={{ gap: 12 }}>
        {pieces.map((p, i) => (
          <span key={i} className="gs-act-chip" style={{ borderRadius: 8, fontSize: level === 1 ? 20 : 15, display: "inline-flex", gap: 8, alignItems: "center" }}>
            <span className="gs-act-num" style={{ width: 22, height: 22 }} />
            {p}
          </span>
        ))}
      </div>
      {level === 2 ? <Lines n={2} /> : null}
    </div>
  );
}

export function TrueFalseActivity({ data, level }: { data: ActivityOf<"truefalse">; level: L }) {
  return (
    <ol className="gs-act-seq2" style={{ ...fill, paddingLeft: 0 }}>
      {data.items.map(([t], i) => (
        <li key={i} style={{ fontSize: level === 1 ? 18 : 15, justifyContent: "space-between" }}>
          <span>
            {i + 1}. {t}
          </span>
          <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{level === 1 ? "YES   NO" : "TRUE   FALSE"}</span>
        </li>
      ))}
    </ol>
  );
}

export function WhoAmIActivity({ data, level }: { data: ActivityOf<"whoami">; level: L }) {
  return (
    <div className="gs-act-split" style={fill}>
      <ol className="gs-act-seq2" style={{ flex: 1.4, paddingLeft: 0 }}>
        {data.clues.map((c, i) => (
          <li key={i} style={{ fontSize: level === 1 ? 17 : 15 }}>
            <span className="gs-act-num" style={{ textAlign: "center", lineHeight: "24px" }}>
              {i + 1}
            </span>
            {c}
          </li>
        ))}
      </ol>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, fontSize: 18 }}>
        <b>Who am I?</b>
        {data.choices ? (
          <div className="gs-act-bank">
            {data.choices.map((c) => (
              <span key={c} className="gs-act-chip">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <div className="gs-act-fill" style={{ flex: "none" }} />
        )}
      </div>
    </div>
  );
}

export function BingoActivity({ data, level, seed }: { data: ActivityOf<"bingo">; level: L; seed: string }) {
  const words = shuffle(data.words, rng(`bingo:${seed}`));
  return (
    <div className="gs-act-bingo" style={fill}>
      {words.map((w) => (
        <div key={w} style={{ fontSize: level === 1 ? 18 : 15 }}>
          {w}
        </div>
      ))}
    </div>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function TrackerActivity({ data, level }: { data: ActivityOf<"tracker">; level: L }) {
  return (
    <table className="gs-act-table" style={fill}>
      <colgroup>
        <col style={{ width: data.rows.length > 1 ? "24%" : "18%" }} />
      </colgroup>
      <thead>
        <tr>
          <th />
          {DAYS.map((d) => (
            <th key={d}>{d}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((r) => (
          <tr key={r}>
            <th style={{ fontSize: data.rows.length > 1 ? 13 : level === 1 ? 16 : 14, lineHeight: 1.15 }}>{r}</th>
            {DAYS.map((d) => (
              <td key={d}>{level === 1 ? <span style={{ fontSize: data.rows.length > 1 ? 20 : 30, color: "#bbb" }}>♡</span> : null}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TallyActivity({ data, level }: { data: ActivityOf<"tally">; level: L }) {
  return (
    <table className="gs-act-table" style={fill}>
      <thead>
        <tr>
          <th>Word I hear</th>
          <th>Tally marks</th>
          {level === 2 ? <th>Total</th> : null}
        </tr>
      </thead>
      <tbody>
        {data.words.map((w) => (
          <tr key={w}>
            <th style={{ fontSize: level === 1 ? 22 : 17 }}>{w}</th>
            <td style={{ width: "60%" }} />
            {level === 2 ? <td /> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FoldRevealActivity({ data, level }: { data: ActivityOf<"foldreveal">; level: L }) {
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", fontSize: level === 1 ? 20 : 16, textAlign: "center" }}>
        {data.question}
        
      </div>
      <div style={{ borderTop: "2px dashed #111", fontSize: 12, textAlign: "center" }}>✂ - - fold back on this line - - ✂</div>
      <div style={{ flex: "none", minHeight: level === 1 ? 64 : 40, padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: level === 1 ? 22 : 18, transform: "rotate(180deg)", fontWeight: 700 }}>
        {data.answer}
      </div>
    </div>
  );
}

/* ---------- tactile / shapes ---------- */

const FINGERS: Array<[number, number, number]> = [
  // x, top y, angle
  [165, 120, -35],
  [230, 40, -8],
  [290, 22, 0],
  [350, 40, 8],
  [405, 80, 18],
];
export function HandActivity({ data, level }: { data: ActivityOf<"hand">; level: L }) {
  return (
    <Svg>
      <g transform="translate(27 26) scale(0.91)">
      <g className="ln" style={{ strokeWidth: 3.5, strokeDasharray: level === 1 ? "8 6" : undefined }}>
        <path d="M215 330 L205 205 Q205 180 230 175 L380 175 Q410 180 410 210 L395 330" />
        {FINGERS.map(([x, y, a], i) => (
          <rect key={i} x={x - 26} y={y} width={52} height={190 - y + (i === 0 ? 60 : 0)} rx={26} transform={`rotate(${a} ${x} 230)`} />
        ))}
      </g>
      {FINGERS.map(([x, y, a], i) => (
        <text key={i} x={x} y={y - 10} textAnchor="middle" fontSize={level === 1 ? 15 : 13} transform={`rotate(${a} ${x} 230)`}>
          {data.fingers[i]}
        </text>
      ))}
      </g>
    </Svg>
  );
}

export function ThermometerActivity({ data, level }: { data: ActivityOf<"thermometer">; level: L }) {
  const n = data.levels.length;
  return (
    <Svg>
      <g className="ln" style={{ strokeWidth: 3.5 }}>
        <rect x={180} y={15} width={44} height={250} rx={22} />
        <circle cx={202} cy={290} r={34} />
      </g>
      {data.levels.map((l, i) => {
        const y = 40 + (i * 210) / Math.max(1, n - 1);
        return (
          <g key={l}>
            <path className="ln" d={`M224 ${y}H260`} style={{ strokeWidth: 2 }} />
            <text x={270} y={y + 6} fontSize={level === 1 ? 19 : 16}>
              {l}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

export function ScaleActivity({ data, level }: { data: ActivityOf<"scale">; level: L }) {
  return (
    <Svg>
      <g className="ln" style={{ strokeWidth: 3.5 }}>
        <path d="M300 40V300M240 305H360M120 70H480" />
        <path d="M120 70L60 170M120 70L180 170M480 70L420 170M480 70L540 170" style={{ strokeWidth: 1.5 }} />
        <path d="M40 170Q120 250 200 170Z M400 170Q480 250 560 170Z" />
      </g>
      {([[120, data.left], [480, data.right]] as const).map(([x, t]) => (
        <text key={x} x={x} y={236} textAnchor="middle" fontSize={level === 1 ? 18 : 15}>
          {wrapLabel(t, 18).map((l, i) => (
            <tspan key={i} x={x} dy={i ? 18 : 0}>
              {l}
            </tspan>
          ))}
        </text>
      ))}
      {level === 2
        ? [282, 312].map((y) => (
            <g key={y} className="ln" style={{ strokeWidth: 1.5, strokeDasharray: "3 5" }}>
              <path d={`M30 ${y}H230M370 ${y}H570`} />
            </g>
          ))
        : null}
    </Svg>
  );
}

export function ClockActivity({ data, level }: { data: ActivityOf<"clock">; level: L }) {
  const n = data.labels.length;
  const w = 600 / n;
  const r = Math.min(110, w / 2 - 20);
  return (
    <Svg>
      {data.labels.map((l, i) => {
        const cx = w * i + w / 2;
        return (
          <g key={l}>
            <circle className="ln" cx={cx} cy={150} r={r} style={{ strokeWidth: 3.5 }} />
            {Array.from({ length: 12 }, (_, k) => {
              const a = (k / 12) * 2 * Math.PI;
              return (
                <text key={k} x={cx + Math.sin(a) * (r - 18)} y={150 - Math.cos(a) * (r - 18) + 5} textAnchor="middle" fontSize={level === 1 ? 14 : 12}>
                  {k === 0 ? 12 : k}
                </text>
              );
            })}
            <circle cx={cx} cy={150} r={4} fill="#111" />
            <text x={cx} y={310} textAnchor="middle" fontSize={level === 1 ? 20 : 17}>
              {l}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

export function BeadsActivity({ data, level }: { data: ActivityOf<"beads">; level: L }) {
  const n = data.count;
  const r = n > 30 ? 8 : n > 10 ? 14 : 22;
  return (
    <Svg>
      <path className="ln" d="M300 40 C 20 40 20 280 300 280 C 580 280 580 40 300 40" style={{ strokeWidth: 1.5 }} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 2 * Math.PI;
        return <circle key={i} className="ln" cx={300 + Math.sin(a) * 230} cy={160 - Math.cos(a) * 118} r={r} style={{ strokeWidth: 2.5, fill: "#fff" }} />;
      })}
      <path className="ln" d="M300 270V315M285 290H315" style={{ strokeWidth: 3 }} />
      <text x={300} y={165} textAnchor="middle" fontSize={level === 1 ? 20 : 16}>
        {data.label}
      </text>
    </Svg>
  );
}

export function CandlesActivity({ data, level }: { data: ActivityOf<"candles">; level: L }) {
  const n = data.candles.length;
  const w = 600 / n;
  const cw = Math.min(56, w - 24);
  return (
    <Svg>
      {n === 4 ? <ellipse className="ln" cx={300} cy={256} rx={285} ry={20} style={{ strokeWidth: 3, strokeDasharray: "14 6" }} /> : null}
      {data.candles.map(([label, shade], i) => {
        const cx = w * i + w / 2;
        const tone = shade === "dark" ? "#555" : shade === "light" ? "#ccc" : "#fff";
        return (
          <g key={i}>
            <path className="ln" d={`M${cx} 40 Q${cx + 26} 80 ${cx} 105 Q${cx - 26} 80 ${cx} 40Z`} style={{ strokeWidth: 2.5 }} />
            <rect className="ln" x={cx - cw / 2} y={112} width={cw} height={140} style={{ strokeWidth: 3, fill: level === 2 ? "#fff" : tone }} />
            <text x={cx} y={n === 4 ? 300 : 282} textAnchor="middle" fontSize={n > 4 ? 13 : level === 1 ? 16 : 14}>
              {wrapLabel(label, n > 4 ? 10 : 16).map((l, j) => (
                <tspan key={j} x={cx} dy={j ? 15 : 0}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

export function BadgeActivity({ data, level }: { data: ActivityOf<"badge">; level: L }) {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    const rr = i % 2 ? 125 : 140;
    return `${300 + Math.sin(a) * rr},${150 - Math.cos(a) * rr}`;
  }).join(" ");
  return (
    <Svg>
      <polygon className="ln" points={pts} style={{ strokeWidth: 3 }} />
      <circle className="ln" cx={300} cy={150} r={100} style={{ strokeWidth: 2, strokeDasharray: "6 6" }} />
      <path className="ln" d="M240 270L220 325L260 305L280 325L285 280M360 270L380 325L340 305L320 325L315 280" style={{ strokeWidth: 3 }} />
      <text x={300} y={level === 1 ? 160 : 100} textAnchor="middle" fontSize={22} fontWeight={700}>
        {data.label}
      </text>
    </Svg>
  );
}

export function TreeActivity({ data, level }: { data: ActivityOf<"tree">; level: L }) {
  const spots: Array<[number, number]> = [
    [150, 90],
    [300, 50],
    [450, 90],
    [190, 190],
    [410, 190],
    [300, 150],
  ];
  return (
    <Svg>
      <path className="ln" d="M285 292V200L210 120M300 200L300 90M315 200L390 120M300 250L230 200M300 250L370 200" style={{ strokeWidth: 6 }} />
      {spots.slice(0, data.leaves).map(([x, y], i) => (
        <g key={i}>
          <ellipse className="ln" cx={x} cy={y} rx={level === 1 ? 62 : 80} ry={38} style={{ strokeWidth: 2.5, fill: "#fff" }} />
          {level === 2 ? <path className="ln" d={`M${x - 55} ${y + 6}H${x + 55}`} style={{ strokeWidth: 1, strokeDasharray: "3 5" }} /> : null}
        </g>
      ))}
      <path className="ln" d="M230 292H370" style={{ strokeWidth: 3 }} />
      <text x={300} y={320} textAnchor="middle" fontSize={level === 1 ? 19 : 16}>
        {data.label}
      </text>
    </Svg>
  );
}

export function LetterActivity({ data, level }: { data: ActivityOf<"letter">; level: L }) {
  const cert = data.style === "certificate";
  return (
    <div
      style={{
        ...fill,
        display: "flex",
        flexDirection: "column",
        border: cert ? "6px double #111" : data.style === "card" ? "2px dashed #111" : "2px solid #111",
        borderRadius: cert ? 4 : 14,
        padding: "8px 16px",
        textAlign: cert ? "center" : "left",
      }}
    >
      <div style={{ fontSize: cert ? 24 : level === 1 ? 20 : 17, fontWeight: cert ? 700 : 400 }}>{data.to}</div>
      <Lines n={data.lines} />
      <div style={{ textAlign: "right", fontSize: 15 }}>
        {cert ? "Signed:" : "Love,"} <span className="gs-act-fill" style={{ display: "inline-block", width: 160 }} />
      </div>
    </div>
  );
}

export function ChecklistActivity({ data, level }: { data: ActivityOf<"checklist">; level: L }) {
  return (
    <ul className="gs-chk" style={{ ...fill, display: "flex", flexDirection: "column", justifyContent: "space-evenly", fontSize: level === 1 ? 19 : 15 }}>
      {data.items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function AcrosticActivity({ data, level }: { data: ActivityOf<"acrostic">; level: L }) {
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", justifyContent: "space-evenly", gap: 2 }}>
      {data.word.split("").map((ch, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10, minHeight: 0 }}>
          <b style={{ fontSize: data.word.length > 5 ? 15 : level === 1 ? 26 : 20, lineHeight: 1.15, width: data.word.length > 5 ? 24 : 32, textAlign: "center", border: "2px solid #111", borderRadius: 6, flex: "none" }}>{ch}</b>
          <span className="gs-act-fill" />
        </div>
      ))}
    </div>
  );
}

export function CopyVerseActivity({ data, level }: { data: ActivityOf<"copyverse">; level: L }) {
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", border: "3px double #111", borderRadius: 16, padding: "6px 16px" }}>
      <div className={level === 1 && !data.mirror ? "gs-trace" : "gs-copy"} style={{ textAlign: "center", transform: data.mirror ? "scaleX(-1)" : undefined }}>
        {data.text}
      </div>
      <Lines n={level === 1 ? 1 : 3} />
    </div>
  );
}

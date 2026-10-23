import { generateCode, generateWordRows, generateWordSearch } from "@/lib/sheet-activities/generate";
import type { ActivityOf } from "@/lib/sheet-activities/schema";

export function WordFindActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"wordfind">;
  level: 1 | 2;
  seed: string;
}) {
  if (level === 1) {
    const words = data.words.filter((w) => w.length <= 8).slice(0, 4);
    const rows = generateWordRows(words, 9, seed);
    return (
      <div className="gs-act-wf1">
        {rows.map((r, i) => (
          <div key={i} className="gs-act-wf1-row">
            <span className="gs-act-letters">{r}</span>
            <span className="gs-act-find">{words[i]}</span>
          </div>
        ))}
      </div>
    );
  }
  const { grid, placed } = generateWordSearch(data.words, 11, seed, true);
  const cell = 26;
  return (
    <div className="gs-act-split">
      <svg viewBox={`0 0 ${cell * 11} ${cell * 11}`} style={{ height: "100%", width: "auto", maxWidth: "62%" }} aria-hidden="true">
        {grid.map((row, r) =>
          row.map((ch, c) => (
            <text key={`${r}-${c}`} x={c * cell + cell / 2} y={r * cell + cell * 0.72} textAnchor="middle" fontSize="17">
              {ch}
            </text>
          )),
        )}
        <rect className="ln" x="1" y="1" width={cell * 11 - 2} height={cell * 11 - 2} rx="8" style={{ strokeWidth: 2 }} />
      </svg>
      <ul className="gs-chk gs-act-wlist" style={{ columns: placed.length > 5 ? 2 : 1 }}>
        {placed.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}

export function SecretCodeActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"secretcode">;
  level: 1 | 2;
  seed: string;
}) {
  const code = generateCode(data.message, seed, level === 1);
  const letters = [...code.keys()].sort();
  const words = data.message.toUpperCase().split(/\s+/);
  return (
    <div className="gs-act-code">
      <div className="gs-act-key">
        {letters.map((l) => (
          <span key={l} className="gs-act-keycell">
            <b>{code.get(l)}</b>
            {l}
          </span>
        ))}
      </div>
      <div className="gs-act-msg">
        {words.map((w, wi) => (
          <span key={wi} className="gs-act-word">
            {[...w].map((ch, i) =>
              /[A-Z]/.test(ch) ? (
                <span key={i} className={`gs-act-slot gs-act-slot-l${level}`}>
                  <b>{code.get(ch)}</b>
                  <i />
                </span>
              ) : (
                <span key={i} className="gs-act-punct">
                  {ch}
                </span>
              ),
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

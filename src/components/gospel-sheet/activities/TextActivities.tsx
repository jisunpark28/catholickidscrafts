import { derange, rng, shuffle } from "@/lib/sheet-activities/rng";
import type { ActivityOf } from "@/lib/sheet-activities/schema";

const DISTRACTORS = ["peace", "light", "joy", "bread", "star"];

export function FillBlankActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"fillblank">;
  level: 1 | 2;
  seed: string;
}) {
  const parts = data.text.split(/(\[[^\]]+\])/).filter(Boolean);
  const blanks = parts.filter((p) => p.startsWith("[")).map((p) => p.slice(1, -1));
  const extra = level === 2 ? DISTRACTORS.filter((d) => !blanks.map((b) => b.toLowerCase()).includes(d)).slice(0, 1) : [];
  const bank = shuffle([...blanks, ...extra], rng(`fb:${seed}`));
  return (
    <div className={`gs-act-fb gs-act-fb-l${level}`}>
      <p>
        {parts.map((p, i) =>
          p.startsWith("[") ? (
            <span key={i} className="gs-act-blank" style={{ minWidth: `${Math.max(3, p.length - 2) * 0.62}em` }} />
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </p>
      <div className="gs-act-bank">
        <span>Word bank:</span>
        {bank.map((w) => (
          <span key={w} className="gs-act-chip">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SequenceActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"sequence">;
  level: 1 | 2;
  seed: string;
}) {
  const scenes = derange(data.scenes.slice(0, 4), rng(`seq:${seed}`));
  if (level === 1) {
    return (
      <div className="gs-act-seq1">
        {scenes.map((s, i) => (
          <div key={i} className="gs-act-frame">
            <span className="gs-act-num" />
            <div className="gs-act-draw" />
            <p>{s}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol className="gs-act-seq2">
      {scenes.map((s, i) => (
        <li key={i}>
          <span className="gs-act-num" />
          {s}
        </li>
      ))}
    </ol>
  );
}

export function MatchUpActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"matchup">;
  level: 1 | 2;
  seed: string;
}) {
  const right = derange(
    data.pairs.map((p) => p[1]),
    rng(`mu:${seed}`),
  );
  return (
    <div className={`gs-act-match gs-act-match-l${level}`}>
      <div>
        {data.pairs.map((p) => (
          <div key={p[0]} className="gs-act-mitem gs-act-mleft">
            {p[0]}
          </div>
        ))}
      </div>
      <div>
        {right.map((r) =>
          level === 1 && !data.text ? (
            <div key={r} className="gs-act-mitem gs-act-mright">
              <span className="gs-ph gs-act-pic">icon_{r}.png</span>
            </div>
          ) : (
            <div key={r} className="gs-act-mitem gs-act-mright">
              {r}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function SortingActivity({
  data,
  level,
  seed,
}: {
  data: ActivityOf<"sorting">;
  level: 1 | 2;
  seed: string;
}) {
  const items = shuffle(data.items.slice(0, level === 1 ? 4 : 6), rng(`so:${seed}`));
  return (
    <div className={`gs-act-sort gs-act-sort-l${level}`}>
      <div className="gs-act-bank">
        {items.map(([t]) => (
          <span key={t} className="gs-act-chip">
            {t}
          </span>
        ))}
      </div>
      <div className="gs-act-cols">
        {[data.left, data.right].map((label) => (
          <div key={label} className="gs-act-basket">
            <b>{label}</b>
            {level === 2 ? Array.from({ length: 3 }, (_, i) => <div key={i} className="gs-wl" />) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FindHiddenActivity({
  data,
  level,
  artFile,
}: {
  data: ActivityOf<"findhidden">;
  level: 1 | 2;
  artFile: string;
}) {
  const objects = data.objects.slice(0, level === 1 ? 3 : 5);
  return (
    <div className="gs-act-split">
      <div className="gs-ph gs-act-scene">{artFile}</div>
      <ul className="gs-chk">
        {objects.map((o) => (
          <li key={o}>
            {o.replace(/_/g, " ")}
            {level === 2 ? " ×___" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DrawSceneActivity({ data, level }: { data: ActivityOf<"drawscene">; level: 1 | 2 }) {
  return (
    <div className="gs-act-drawscene">
      <div className="gs-act-prompt">Draw: {data.prompt}</div>
      <div className="gs-act-draw" />
      {level === 2 ? <div className="gs-wl" /> : null}
    </div>
  );
}

export function PrayerFrameActivity({ data, level }: { data: ActivityOf<"prayerframe">; level: 1 | 2 }) {
  return (
    <div className={`gs-act-prayer gs-act-prayer-l${level}`}>
      {data.starters.map((s, i) => (
        <div key={i} className="gs-act-pline">
          <span>{s}</span>
          {/^(amen\.?|dear lord,?)$/i.test(s) ? null : <span className="gs-act-fill" />}
        </div>
      ))}
    </div>
  );
}

import type { GospelSheetView, SheetLevelNumber } from "@/lib/gospel-sheet";
import { ActivityBlock, activityFor } from "./activities";

/** Planned illustration file names; rendered as labelled placeholder boxes until art exists. */
export type GospelSheetArt = { main: string; heart: string; icons: string[] };

/** One letter page of the Sunday Gospel sheet. */
export function GospelSheet({
  sheet,
  level,
  art,
}: {
  sheet: GospelSheetView;
  level: SheetLevelNumber;
  art?: GospelSheetArt;
}) {
  const c = level === 1 ? sheet.levels.level1 : sheet.levels.level2;
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
          <div className={sheet.gospelRef.length > 48 ? "gs-meta gs-meta-long" : "gs-meta"}>
            <span className="gs-dot" style={{ background: sheet.dotColor }} />
            {sheet.sundayLabel}
            <br />
            {sheet.gospelRef}
          </div>
        </header>

        <div className="gs-box gs-story">
          {art ? <div className="gs-ph gs-ph-main">{art.main}</div> : null}
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

        <ActivityBlock activity={activityFor(c)} level={level} seed={`${sheet.slug}-${level}`} artFile={art?.heart} />

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

        {art && art.icons.length ? (
          <div className="gs-ph-icons">
            {art.icons.map((icon) => (
              <div key={icon} className="gs-ph gs-ph-icon">
                {icon}
              </div>
            ))}
          </div>
        ) : null}
        {c.prayer ? <div className="gs-prayer">&ldquo;{c.prayer}&rdquo;</div> : null}
        <footer>New free sheet every week at catholickidscrafts.com</footer>
      </div>
    </div>
  );
}

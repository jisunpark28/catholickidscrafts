import type { GospelSheetView, SheetLevelNumber } from "@/lib/gospel-sheet";
import { ActivityBlock, activityFor } from "./activities";

/** Planned illustration file names; rendered as labelled placeholder boxes until art exists. */
export type GospelSheetArt = { main: string; heart: string; icons: string[] };

export type GospelSheetVariant = "full" | "base";

/**
 * One letter page of the Sunday Gospel sheet.
 * `variant="base"` keeps locked chrome + activity, but hides editable text so Fabric can overlay it.
 */
export function GospelSheet({
  sheet,
  level,
  art,
  variant = "full",
}: {
  sheet: GospelSheetView;
  level: SheetLevelNumber;
  art?: GospelSheetArt;
  variant?: GospelSheetVariant;
}) {
  const c = level === 1 ? sheet.levels.level1 : sheet.levels.level2;
  const base = variant === "base";
  const hide = base ? ({ visibility: "hidden" } as const) : undefined;

  return (
    <div className={`gs gs-l${level}${base ? " gs-base" : ""}`} data-sheet-variant={variant}>
      <div className="gs-page" data-sheet-page>
        <header>
          <div>
            <h1 data-sheet-field="title" style={hide}>
              {c.title}
            </h1>
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
          <p data-sheet-field="story" style={hide}>
            {c.story}
          </p>
        </div>

        {level === 1 ? (
          <div className="gs-box">
            <h2>Trace the words</h2>
            <div className="gs-trace" data-sheet-field="keyLine" style={hide}>
              {c.keyLine}
            </div>
            <div className="gs-trace" aria-hidden style={hide}>
              {c.keyLine}
            </div>
          </div>
        ) : (
          <div className="gs-box">
            <h2>Copy the key line</h2>
            <div className="gs-copy" data-sheet-field="keyLine" style={hide}>
              {c.keyLine}
            </div>
            <div className="gs-wl" />
            <div className="gs-wl" />
          </div>
        )}

        <div data-sheet-activity>
          <ActivityBlock activity={activityFor(c)} level={level} seed={`${sheet.slug}-${level}`} artFile={art?.heart} />
        </div>

        <div className="gs-row">
          <div className="gs-box">
            <h2>{level === 1 ? "Let's talk" : "Think about it"}</h2>
            {c.questions.map((q, i) => (
              <div key={i}>
                <p className="gs-q">
                  <span aria-hidden>{i + 1}. </span>
                  <span data-sheet-field={`q${i}` as "q0" | "q1"} style={hide}>
                    {q}
                  </span>
                </p>
                <div className="gs-wl" />
              </div>
            ))}
          </div>
          <div className="gs-box" style={level === 2 ? { flex: 0.7 } : undefined}>
            <h2>This week I will…</h2>
            <ul className="gs-chk">
              {c.actions.map((a, i) => (
                <li key={i}>
                  <span data-sheet-field={`action${i}` as "action0" | "action1" | "action2"} style={hide}>
                    {a}
                  </span>
                </li>
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
        {c.prayer ? (
          <div className="gs-prayer" data-sheet-field="prayer" style={hide}>
            &ldquo;{c.prayer}&rdquo;
          </div>
        ) : null}
        <footer>New free sheet every week at catholickidscrafts.com</footer>
      </div>
    </div>
  );
}

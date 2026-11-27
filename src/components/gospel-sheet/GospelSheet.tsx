import type { GospelSheetView, SheetLevelNumber } from "@/lib/gospel-sheet";
import { ActivityBlock, activityFor } from "./activities";

export type GospelSheetExtras = {
  notes: readonly string[];
  verse?: string;
  reference?: string;
  footer?: string;
};

/** Two paragraphs when the story would run past about three lines at 12pt. */
function storyParagraphs(story: string): string[] {
  if (story.length <= 220) return [story];
  const sentences = story.split(/(?<=\.)\s+(?=[A-Z])/);
  if (sentences.length < 2) return [story];
  const mid = Math.ceil(sentences.length / 2);
  const first = sentences.slice(0, mid).join(" ").trim();
  const second = sentences.slice(mid).join(" ").trim();
  return second ? [first, second] : [story];
}

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
  extras,
}: {
  sheet: GospelSheetView;
  level: SheetLevelNumber;
  art?: GospelSheetArt;
  variant?: GospelSheetVariant;
  /** Mass sheets only: family note. Sunday sheets omit this. */
  extras?: GospelSheetExtras;
}) {
  const c = level === 1 ? sheet.levels.level1 : sheet.levels.level2;
  const base = variant === "base";
  const hide = base ? ({ visibility: "hidden" } as const) : undefined;
  const mass = Boolean(extras);
  const paragraphs = mass ? storyParagraphs(c.story) : [c.story];
  const favoriteStep = mass && level === 2 && activityFor(c).type === "wordorder";

  return (
    <div className={`gs gs-l${level}${base ? " gs-base" : ""}${extras ? " gs-mass" : ""}`} data-sheet-variant={variant}>
      <div className="gs-page" data-sheet-page>
        <header>
          <div>
            {/* p.gs-title keeps print styling; avoid a second page <h1> on resource landings. */}
            <p className="gs-title" data-sheet-field="title" style={hide}>
              {c.title}
            </p>
            {mass ? null : (
              <div className="gs-sub" data-sheet-field="subtitle" style={hide}>
                {sheet.liturgicalName} · Level {level}
              </div>
            )}
          </div>
          <div
            className={sheet.gospelRef.length > 48 && !mass ? "gs-meta gs-meta-long" : "gs-meta"}
            data-sheet-field="meta"
            style={hide}
          >
            {mass ? (
              <>
                Name: <span className="gs-name-line" />
                <br />
                Level {level}
                <br />
                {sheet.gospelRef}
              </>
            ) : (
              <>
                <span className="gs-dot" style={{ background: sheet.dotColor }} />
                {sheet.sundayLabel}
                <br />
                {sheet.gospelRef}
              </>
            )}
          </div>
        </header>

        <div className="gs-box gs-story">
          {art && !/\.png$/i.test(art.main) ? <div className="gs-ph gs-ph-main">{art.main}</div> : null}
          <h2 data-sheet-field="h2_story" style={hide}>
            Today&apos;s Story
          </h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} data-sheet-field="story" style={hide}>
              {paragraph}
            </p>
          ))}
        </div>

        {level === 1 ? (
          <div className="gs-box">
            <h2 data-sheet-field="h2_key" style={hide}>
              Trace the words
            </h2>
            {mass ? (
              <div className="gs-trace-guide" data-sheet-field="keyLine" style={hide}>
                <span className="gs-trace-letters">{c.keyLine}</span>
              </div>
            ) : (
              <>
                <div className="gs-trace" data-sheet-field="keyLine" style={hide}>
                  {c.keyLine}
                </div>
                <div className="gs-trace" aria-hidden style={hide}>
                  {c.keyLine}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="gs-box">
            <h2 data-sheet-field="h2_key" style={hide}>
              Copy the key line
            </h2>
            <div className="gs-copy" data-sheet-field="keyLine" style={hide}>
              {c.keyLine}
            </div>
            <div className="gs-wl" data-sheet-chrome="writeline" />
            <div className="gs-wl" data-sheet-chrome="writeline" />
          </div>
        )}

        <div data-sheet-activity>
          <ActivityBlock
            activity={activityFor(c)}
            level={level}
            seed={`${sheet.slug}-${level}`}
            artFile={art?.heart}
            hideEditableText={base}
            favoriteStep={favoriteStep}
          />
        </div>

        <div className="gs-row">
          <div className="gs-box">
            <h2 data-sheet-field="h2_talk" style={hide}>
              {level === 1 ? "Let's talk" : "Think about it"}
            </h2>
            {c.questions.map((q, i) => (
              <div key={i}>
                <p className="gs-q">
                  <span data-sheet-field={`qnum${i}`} style={hide}>
                    {i + 1}.{" "}
                  </span>
                  <span data-sheet-field={`q${i}` as "q0" | "q1"} style={hide}>
                    {q}
                  </span>
                </p>
                <div className="gs-wl" data-sheet-chrome="writeline" />
              </div>
            ))}
          </div>
          <div className="gs-box" style={level === 2 ? { flex: 0.7 } : undefined}>
            <h2 data-sheet-field="h2_actions" style={hide}>
              This week I will…
            </h2>
            <ul className="gs-chk">
              {c.actions.map((a, i) => (
                <li key={i}>
                  <span className="gs-chk-box" data-sheet-chrome="checkbox" aria-hidden />
                  <span data-sheet-field={`action${i}` as "action0" | "action1" | "action2"} style={hide}>
                    {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {art && art.icons.length && !mass ? (
          <div className="gs-ph-icons">
            {art.icons.map((icon) => (
              <div key={icon} className="gs-ph gs-ph-icon">
                {/\.png$/i.test(icon) || icon.startsWith("icon_") ? null : icon}
              </div>
            ))}
          </div>
        ) : null}
        {extras && !base ? (
          <div className="gs-note">
            <p className="gs-note-title">A note for families</p>
            <ul>
              {extras.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            {extras.verse ? (
              <p className="gs-note-verse">
                {extras.verse}
                {extras.reference ? <span> {extras.reference}</span> : null}
              </p>
            ) : null}
          </div>
        ) : null}
        {mass && level === 1 && !base ? (
          <div className="gs-drawit">
            <h2>Draw it!</h2>
            <div className="gs-drawit-box" />
          </div>
        ) : null}
        {c.prayer ? (
          <div className="gs-prayer" data-sheet-field="prayer" style={hide}>
            &ldquo;{c.prayer}&rdquo;
          </div>
        ) : null}
        <footer data-sheet-field="footer" style={hide}>
          {extras?.footer ?? "New free sheet every week at catholickidscrafts.com"}
        </footer>
      </div>
    </div>
  );
}

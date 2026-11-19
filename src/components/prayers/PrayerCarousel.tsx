"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fredoka } from "@/components/liturgy/fredoka";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { phraseImageSrc, prayerCoverSrc } from "@/lib/prayers/prayer-art";
import {
  activityPhrases,
  blankTokens,
  GENERIC_READY_PROMPT,
  hasLittle,
  sameWords,
  activityText,
  splitVersicle,
  type CarouselPrayer,
  type PrayerPhrase,
} from "@/lib/prayers/prayer-phrases";
import { activityPath, prayerSheetsFor } from "@/lib/resource/activities";

type Level = "little" | "growing" | "ready";
const LEVELS: { id: Level; emoji: string; name: string; how: string }[] = [
  { id: "little", emoji: "🌱", name: "Little", how: "Tap the missing word." },
  { id: "growing", emoji: "⭐", name: "Growing", how: "Fill in the blanks." },
  { id: "ready", emoji: "🕊️", name: "Ready", how: "Look at the picture and write each line." },
];

type Props = {
  prayer: CarouselPrayer;
  /** Picture of the live prayer card, used when the prayer has no cover of its own. */
  liveImage?: string | null;
  onClose: () => void;
  /** Open another prayer (the "Hail Mary…" lines of the Angelus). */
  onOpen: (slug: string) => void;
};

function setPrayerParam(slug: string | null) {
  const u = new URL(window.location.href);
  if (slug) u.searchParams.set("prayer", slug);
  else u.searchParams.delete("prayer");
  history.replaceState(history.state, "", u.pathname + u.search + u.hash);
}

/** Full-screen prayer: a cover, one phrase per slide, then the Little / Growing / Ready activities. */
export function PrayerCarousel(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<CarouselOverlay {...props} />, document.body);
}

function Picture({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={`pcx-pic ${className ?? ""}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} draggable={false} />
      ) : (
        <span className="pcx-pic-ph" role="img" aria-label={alt}>
          ✝
        </span>
      )}
    </div>
  );
}

function CarouselOverlay({ prayer, liveImage, onClose, onOpen }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const phrases = prayer.phrases;
  const last = phrases.length + 1; // 0 cover, 1..n phrases, n+1 activities
  const [i, setI] = useState(0);
  const levels = useMemo(() => LEVELS.filter((l) => l.id !== "little" || hasLittle(prayer)), [prayer]);
  const [level, setLevel] = useState<Level>(levels[0]!.id);
  const cover = prayerCoverSrc(prayer, liveImage);

  // Page behind: inert + no scroll; ?prayer=<slug> while open (restored on close).
  useEffect(() => {
    const host = rootRef.current?.parentElement === document.body ? rootRef.current : null;
    const touched: Element[] = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === host || el.tagName === "SCRIPT" || el.hasAttribute("inert")) return;
      el.setAttribute("inert", "");
      touched.push(el);
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setPrayerParam(prayer.slug);
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      touched.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      if (new URLSearchParams(window.location.search).get("prayer") === prayer.slug) setPrayerParam(null);
    };
  }, [prayer.slug]);

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(last, n))), [last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (!typing && i < last && e.key === "ArrowRight") go(i + 1);
      else if (!typing && i <= last && e.key === "ArrowLeft") go(i - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [i, last, go, onClose]);

  useEffect(() => {
    if (i === last) headRef.current?.focus();
  }, [i, last]);

  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    touch.current = p ? { x: p.clientX, y: p.clientY } : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    const p = e.changedTouches[0];
    touch.current = null;
    if (!s || !p) return;
    const dx = p.clientX - s.x;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(p.clientY - s.y)) return;
    go(dx < 0 ? i + 1 : i - 1);
  };

  const ph = i >= 1 && i <= phrases.length ? phrases[i - 1]! : null;
  const sheets = prayerSheetsFor(prayer.slug);

  return (
    <div ref={rootRef} className={`pcx ${fredoka.variable}`} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
      <div className="pcx-header">
        <div className="pcx-head-left">
          <ShareToClassroomButton query={`prayer=${prayer.slug}`} />
        </div>
        <h2 id={`${uid}-title`} className="pcx-title">
          {prayer.title}
        </h2>
        <button ref={closeRef} className="pcx-close" type="button" aria-label={`Close ${prayer.title}`} onClick={onClose}>
          ✕
        </button>
      </div>

      {i < last ? (
        <div className="pcx-body" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="pcx-slide" aria-live="polite">
            {ph ? (
              <>
                <Picture src={phraseImageSrc(prayer, ph, liveImage)} alt={ph.art} />
                <PhraseText ph={ph} />
                {ph.opens ? (
                  <button type="button" className="pcx-open" onClick={() => onOpen(ph.opens!)}>
                    Pray the Hail Mary →
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <Picture src={cover} alt={prayer.title} className="pcx-pic--cover" />
                <p className="pcx-cover-title">{prayer.title}</p>
                <p className="pcx-cover-sub">One line at a time. Swipe or tap → to begin.</p>
              </>
            )}
          </div>
          <div className="pcx-controls">
            <button
              type="button"
              className="pcx-arrow"
              aria-label="Previous"
              style={{ visibility: i === 0 ? "hidden" : "visible" }}
              onClick={() => go(i - 1)}
            >
              ‹
            </button>
            <div className="pcx-dots" aria-label={i === 0 ? "Cover" : `Line ${i} of ${phrases.length}`}>
              {phrases.map((p) => (
                <span key={p.n} className={`pcx-dot${p.n === i ? " is-cur" : p.n < i ? " is-done" : ""}`} />
              ))}
            </div>
            <button type="button" className="pcx-arrow pcx-next" aria-label={i === last - 1 ? "Activities" : "Next"} onClick={() => go(i + 1)}>
              ›
            </button>
          </div>
          {prayer.sourcePending ? null : <p className="pcx-source">Text: {prayer.source}</p>}
        </div>
      ) : (
        <div className="pcx-body pcx-body--act">
          <div className="pcx-act">
            <h3 ref={headRef} tabIndex={-1} className="pcx-act-title">
              🎉 You prayed the {prayer.title}! Let&apos;s practise.
            </h3>
            <div className="pcx-tabs" role="tablist" aria-label="Level">
              {levels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={level === l.id}
                  className={`pcx-tab${level === l.id ? " is-on" : ""}`}
                  onClick={() => setLevel(l.id)}
                >
                  <span aria-hidden>{l.emoji}</span> {l.name}
                </button>
              ))}
            </div>
            <p className="pcx-how">{LEVELS.find((l) => l.id === level)!.how}</p>
            {level === "little" ? <LittleActivity key="little" prayer={prayer} /> : null}
            {level === "growing" ? <GrowingActivity key="growing" prayer={prayer} /> : null}
            {level === "ready" ? <ReadyActivity key="ready" prayer={prayer} liveImage={liveImage} /> : null}

            {sheets.length ? (
              <section className="pcx-sheets" aria-labelledby={`${uid}-sheets`}>
                <h3 id={`${uid}-sheets`} className="pcx-sheets-title">
                  Printable worksheets <span className="pcx-plus">Plus</span>
                </h3>
                <ul>
                  {sheets.map(({ activity, level: lv, part, parts }) => {
                    const meta = LEVELS.find((l) => l.id === lv)!;
                    return (
                      <li key={activity.slug}>
                        <Link href={activityPath(activity.slug)} className="pcx-sheet">
                          <span aria-hidden>{meta.emoji}</span> {meta.name} worksheet
                          {parts > 1 ? ` (Part ${part} of ${parts})` : ""}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
            <div className="pcx-act-foot">
              <button type="button" className="pcx-btn" onClick={() => go(1)}>
                ↺ Pray it again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhraseText({ ph }: { ph: PrayerPhrase }) {
  const { mark, text } = splitVersicle(ph.text);
  return (
    <p className={`pcx-text${text.length > 70 ? " is-long" : ""}`}>
      {mark ? <span className="pcx-mark">{mark}.</span> : null}
      {text}
    </p>
  );
}

/** Rotate the three choices so the answer is not always first. */
function choices(ph: PrayerPhrase): string[] {
  const o = ph.little!.options;
  const k = ph.n % 3;
  return [...o.slice(k), ...o.slice(0, k)];
}

function LittleActivity({ prayer }: { prayer: CarouselPrayer }) {
  const rows = prayer.phrases.filter((ph) => ph.little);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<Record<number, string>>({});
  const count = rows.filter((r) => done[r.n]).length;
  return (
    <ol className="pcx-rows">
      {rows.map((ph) => (
        <li key={ph.n} className={`pcx-row${done[ph.n] ? " is-ok" : ""}`}>
          <p className="pcx-line">
            {blankTokens(ph.text, [ph.little!.answer]).map((t, k) =>
              t.blank ? (
                <span key={k} className={`pcx-gap${done[ph.n] ? " is-filled" : ""}`}>
                  {done[ph.n] ? t.text : "\u00a0"}
                </span>
              ) : (
                <span key={k}>{t.text} </span>
              ),
            )}
          </p>
          <div className="pcx-choices">
            {choices(ph).map((o) => (
              <button
                key={o}
                type="button"
                disabled={done[ph.n]}
                className={`pcx-choice${wrong[ph.n] === o ? " is-wrong" : ""}${done[ph.n] && o === ph.little!.answer ? " is-right" : ""}`}
                onClick={() => {
                  if (o === ph.little!.answer) setDone((d) => ({ ...d, [ph.n]: true }));
                  else setWrong((w) => ({ ...w, [ph.n]: o }));
                }}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="pcx-feedback" aria-live="polite">
            {done[ph.n] ? "✓ Yes!" : wrong[ph.n] ? "Try again!" : ""}
          </p>
        </li>
      ))}
      <li className="pcx-score" aria-live="polite">
        {count === rows.length ? "🌟 You found every word!" : `${count} / ${rows.length}`}
      </li>
    </ol>
  );
}

function GrowingActivity({ prayer }: { prayer: CarouselPrayer }) {
  const rows = activityPhrases(prayer);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  let total = 0;
  let right = 0;
  const list = rows.map((ph) => {
    const toks = blankTokens(ph.text, ph.blanks ?? []);
    return (
      <li key={ph.n} className="pcx-row">
        <p className="pcx-line">
          {toks.map((t, k) => {
            if (!t.blank) return <span key={k}>{t.text} </span>;
            const id = `${ph.n}-${k}`;
            const ok = sameWords(vals[id] ?? "", t.text);
            total += 1;
            if (ok) right += 1;
            return (
              <input
                key={k}
                className={`pcx-input${checked ? (ok ? " is-right" : " is-wrong") : ""}`}
                style={{ width: `${Math.max(4, t.text.length + 2)}ch` }}
                aria-label={`Line ${ph.n}, missing word`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={vals[id] ?? ""}
                onChange={(e) => {
                  setChecked(false);
                  setVals((v) => ({ ...v, [id]: e.target.value }));
                }}
              />
            );
          })}
        </p>
      </li>
    );
  });
  return (
    <>
      <ol className="pcx-rows">{list}</ol>
      <div className="pcx-check">
        <button type="button" className="pcx-btn" onClick={() => setChecked(true)}>
          Check
        </button>
        <span aria-live="polite">{checked ? (right === total ? "🌟 All right!" : `${right} / ${total} right. Try the red ones again.`) : ""}</span>
      </div>
    </>
  );
}

function ReadyActivity({ prayer, liveImage }: { prayer: CarouselPrayer; liveImage?: string | null }) {
  const rows = activityPhrases(prayer);
  const [vals, setVals] = useState<Record<number, string>>({});
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <ol className="pcx-rows">
      {rows.map((ph) => {
        const ok = sameWords(vals[ph.n] ?? "", activityText(ph.text));
        const prompt = ph.prompt && ph.prompt !== GENERIC_READY_PROMPT ? ph.prompt : `Picture: “${ph.art}”. Write this line.`;
        return (
          <li key={ph.n} className="pcx-row pcx-row--ready">
            <Picture src={phraseImageSrc(prayer, ph, liveImage)} alt={ph.art} className="pcx-pic--small" />
            <div className="pcx-ready-main">
              <p className="pcx-prompt">
                {prompt} <span className="pcx-count">({ph.words} {ph.words === 1 ? "word" : "words"})</span>
              </p>
              <textarea
                className={`pcx-write${checked[ph.n] ? (ok ? " is-right" : " is-wrong") : ""}`}
                rows={2}
                aria-label={`Line ${ph.n}`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={vals[ph.n] ?? ""}
                onChange={(e) => {
                  setChecked((c) => ({ ...c, [ph.n]: false }));
                  setVals((v) => ({ ...v, [ph.n]: e.target.value }));
                }}
              />
              <div className="pcx-check">
                <button type="button" className="pcx-btn pcx-btn--soft" onClick={() => setHints((h) => ({ ...h, [ph.n]: !h[ph.n] }))} aria-expanded={!!hints[ph.n]}>
                  {hints[ph.n] ? "Hide hint" : "Show hint"}
                </button>
                <button type="button" className="pcx-btn" onClick={() => setChecked((c) => ({ ...c, [ph.n]: true }))}>
                  Check
                </button>
                <span aria-live="polite">{checked[ph.n] ? (ok ? "✓ Beautiful!" : "Not quite. Try again!") : ""}</span>
              </div>
              {hints[ph.n] ? <p className="pcx-hint">First letters: {ph.letters}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

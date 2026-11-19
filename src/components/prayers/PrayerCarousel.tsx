"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fredoka } from "@/components/liturgy/fredoka";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { phraseImageSrc, prayerCoverSrc } from "@/lib/prayers/prayer-art";
import {
  activityText,
  blankTokens,
  sameWords,
  splitVersicle,
  type CarouselPrayer,
  type PrayerPhrase,
} from "@/lib/prayers/prayer-phrases";
import { activityPath, prayerSheetsFor, type ResourceActivity } from "@/lib/resource/activities";
import type { PrayerSheetLevel } from "@/lib/resource/prayer-sheet-list";

export type StudyMode = "read" | "word-check" | "word-writing" | "sentence-writing";

const MODES: { id: StudyMode; name: string; how: string; sheet: PrayerSheetLevel }[] = [
  { id: "read", name: "Read", how: "Read each line aloud.", sheet: "ready" },
  { id: "word-check", name: "Word Check", how: "Tap each blank to fill the word.", sheet: "little" },
  { id: "word-writing", name: "Word Writing", how: "Type the missing words.", sheet: "growing" },
  { id: "sentence-writing", name: "Sentence Writing", how: "Write the full line.", sheet: "ready" },
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

function phraseBlanks(ph: PrayerPhrase): string[] {
  if (ph.blanks?.length) return ph.blanks;
  if (ph.little?.answer) return [ph.little.answer];
  return [];
}

/** Full-screen prayer: cover + study mode, one phrase per slide, then printable preview. */
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
  const last = phrases.length + 1; // 0 cover, 1..n phrases, n+1 printable
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<StudyMode | null>(null);
  const cover = prayerCoverSrc(prayer, liveImage);
  const modeMeta = mode ? MODES.find((m) => m.id === mode)! : null;

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

  const startMode = useCallback(
    (next: StudyMode) => {
      setMode(next);
      setI(1);
    },
    [],
  );

  const backToCover = useCallback(() => {
    setMode(null);
    setI(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (!typing && mode && i < last && e.key === "ArrowRight") go(i + 1);
      else if (!typing && i > 0 && e.key === "ArrowLeft") {
        if (i === 1) backToCover();
        else go(i - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [i, last, go, onClose, mode, backToCover]);

  useEffect(() => {
    if (i === last) headRef.current?.focus();
  }, [i, last]);

  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    touch.current = p ? { x: p.clientX, y: p.clientY } : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!mode) return;
    const s = touch.current;
    const p = e.changedTouches[0];
    touch.current = null;
    if (!s || !p) return;
    const dx = p.clientX - s.x;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(p.clientY - s.y)) return;
    if (dx < 0) go(i + 1);
    else if (i === 1) backToCover();
    else go(i - 1);
  };

  const ph = i >= 1 && i <= phrases.length ? phrases[i - 1]! : null;
  const sheets = useMemo(() => {
    const all = prayerSheetsFor(prayer.slug);
    if (!modeMeta) return all;
    const matched = all.filter((s) => s.level === modeMeta.sheet);
    if (matched.length) return matched;
    // Fallbacks when a mode has no worksheet (e.g. Word Check without Little).
    if (modeMeta.sheet === "little") {
      const growing = all.filter((s) => s.level === "growing");
      if (growing.length) return growing;
    }
    return all;
  }, [prayer.slug, modeMeta]);

  return (
    <div ref={rootRef} className={`pcx ${fredoka.variable}`} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
      <div className="pcx-header">
        <div className="pcx-head-left">
          <ShareToClassroomButton query={`prayer=${prayer.slug}`} />
        </div>
        <h2 id={`${uid}-title`} className="pcx-title">
          {prayer.title}
          {modeMeta ? <span className="pcx-mode-tag">{modeMeta.name}</span> : null}
        </h2>
        <button ref={closeRef} className="pcx-close" type="button" aria-label={`Close ${prayer.title}`} onClick={onClose}>
          ✕
        </button>
      </div>

      {i === 0 ? (
        <div className="pcx-body">
          <div className="pcx-slide" aria-live="polite">
            <Picture src={cover} alt={prayer.title} className="pcx-pic--cover" />
            <p className="pcx-cover-title">{prayer.title}</p>
            <div className="pcx-modes" role="group" aria-label="Study mode">
              {MODES.map((m) => (
                <button key={m.id} type="button" className="pcx-mode" onClick={() => startMode(m.id)}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : i < last && mode ? (
        <div className="pcx-body" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="pcx-slide" aria-live="polite">
            {ph ? (
              <>
                <Picture src={phraseImageSrc(prayer, ph, liveImage)} alt={ph.art} />
                <PhraseInteraction key={`${mode}-${ph.n}`} ph={ph} mode={mode} />
                {ph.opens ? (
                  <button type="button" className="pcx-open" onClick={() => onOpen(ph.opens!)}>
                    Pray the Hail Mary →
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="pcx-controls">
            <button
              type="button"
              className="pcx-arrow"
              aria-label="Previous"
              onClick={() => (i === 1 ? backToCover() : go(i - 1))}
            >
              ‹
            </button>
            <div className="pcx-dots" aria-label={`Line ${i} of ${phrases.length}`}>
              {phrases.map((p) => (
                <span key={p.n} className={`pcx-dot${p.n === i ? " is-cur" : p.n < i ? " is-done" : ""}`} />
              ))}
            </div>
            <button
              type="button"
              className="pcx-arrow pcx-next"
              aria-label={i === last - 1 ? "Printable" : "Next"}
              onClick={() => go(i + 1)}
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <div className="pcx-body pcx-body--act">
          <div className="pcx-act">
            <h3 ref={headRef} tabIndex={-1} className="pcx-act-title">
              Printable
              <span className="pcx-plus">Plus</span>
            </h3>
            {sheets.length ? (
              <ul className="pcx-print-list">
                {sheets.map(({ activity, part, parts }) => (
                  <li key={activity.slug}>
                    <PrintablePreview activity={activity} part={part} parts={parts} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pcx-how">No printable for this prayer yet.</p>
            )}
            <div className="pcx-act-foot">
              <button type="button" className="pcx-btn pcx-btn--soft" onClick={backToCover}>
                Choose another mode
              </button>
              {mode ? (
                <button type="button" className="pcx-btn" onClick={() => go(1)}>
                  Practice again
                </button>
              ) : null}
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

function PhraseInteraction({ ph, mode }: { ph: PrayerPhrase; mode: StudyMode }) {
  if (ph.opens || mode === "read") return <PhraseText ph={ph} />;
  if (mode === "word-check") return <WordCheckPhrase ph={ph} />;
  if (mode === "word-writing") return <WordWritingPhrase ph={ph} />;
  return <SentenceWritingPhrase ph={ph} />;
}

function WordCheckPhrase({ ph }: { ph: PrayerPhrase }) {
  const blanks = phraseBlanks(ph);
  const toks = blanks.length ? blankTokens(ph.text, blanks) : null;
  const [filled, setFilled] = useState<Record<number, boolean>>({});

  if (!toks) return <PhraseText ph={ph} />;

  return (
    <p className={`pcx-text pcx-text--interact${activityText(ph.text).length > 70 ? " is-long" : ""}`}>
      {toks.map((t, k) =>
        t.blank ? (
          <button
            key={k}
            type="button"
            className={`pcx-blank-btn${filled[k] ? " is-filled" : ""}`}
            aria-label={filled[k] ? t.text : `Reveal missing word`}
            onClick={() => setFilled((f) => ({ ...f, [k]: true }))}
          >
            {filled[k] ? t.text : "\u00a0"}
          </button>
        ) : (
          <span key={k}>{t.text} </span>
        ),
      )}
    </p>
  );
}

function WordWritingPhrase({ ph }: { ph: PrayerPhrase }) {
  const blanks = phraseBlanks(ph);
  const toks = blanks.length ? blankTokens(ph.text, blanks) : null;
  const [vals, setVals] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  if (!toks) return <SentenceWritingPhrase ph={ph} />;

  let total = 0;
  let right = 0;

  return (
    <div className="pcx-phrase-act">
      <p className={`pcx-text pcx-text--interact${activityText(ph.text).length > 70 ? " is-long" : ""}`}>
        {toks.map((t, k) => {
          if (!t.blank) return <span key={k}>{t.text} </span>;
          const ok = sameWords(vals[k] ?? "", t.text);
          total += 1;
          if (ok) right += 1;
          return (
            <input
              key={k}
              className={`pcx-input${checked ? (ok ? " is-right" : " is-wrong") : ""}`}
              style={{ width: `${Math.max(4, t.text.length + 2)}ch` }}
              aria-label={`Missing word`}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={vals[k] ?? ""}
              onChange={(e) => {
                setChecked(false);
                setVals((v) => ({ ...v, [k]: e.target.value }));
              }}
            />
          );
        })}
      </p>
      <div className="pcx-check">
        <button type="button" className="pcx-btn" onClick={() => setChecked(true)}>
          Check
        </button>
        <span aria-live="polite">
          {checked ? (right === total ? "All right!" : `${right} / ${total} right`) : ""}
        </span>
      </div>
    </div>
  );
}

function SentenceWritingPhrase({ ph }: { ph: PrayerPhrase }) {
  const target = activityText(ph.text);
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const ok = sameWords(val, target);

  return (
    <div className="pcx-phrase-act">
      <textarea
        className={`pcx-write${checked ? (ok ? " is-right" : " is-wrong") : ""}`}
        rows={2}
        aria-label="Write the line"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Write this line…"
        value={val}
        onChange={(e) => {
          setChecked(false);
          setVal(e.target.value);
        }}
      />
      <div className="pcx-check">
        {ph.letters ? (
          <button
            type="button"
            className="pcx-btn pcx-btn--soft"
            onClick={() => setHint((h) => !h)}
            aria-expanded={hint}
          >
            {hint ? "Hide hint" : "Hint"}
          </button>
        ) : null}
        <button type="button" className="pcx-btn" onClick={() => setChecked(true)}>
          Check
        </button>
        <span aria-live="polite">{checked ? (ok ? "Beautiful!" : "Not quite — try again") : ""}</span>
      </div>
      {hint && ph.letters ? <p className="pcx-hint">First letters: {ph.letters}</p> : null}
    </div>
  );
}

function PrintablePreview({
  activity,
  part,
  parts,
}: {
  activity: ResourceActivity;
  part: number;
  parts: number;
}) {
  const src = activity.previews.color || activity.previews.bw;
  const label = parts > 1 ? `${activity.title} (Part ${part} of ${parts})` : activity.title;
  return (
    <Link href={activityPath(activity.slug)} className="pcx-print">
      <span className="pcx-print-pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
      </span>
      <span className="pcx-print-meta">
        <span className="pcx-print-name">{label}</span>
        <span className="pcx-print-cta">Open printable →</span>
      </span>
    </Link>
  );
}

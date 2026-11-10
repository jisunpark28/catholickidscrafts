"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DAY_SET, MODES, MODE_META, MYSTERIES, ORDINALS, PRAYERS, SETS,
  beadKey, buildSteps, type MysterySet, type RosaryMode, type RosaryStep,
} from "@/lib/prayers/rosary";
import { rosaryGeom, type RosaryGeom, type RosaryPoint, type Viewport } from "./rosary-geometry";

const ROSE = "/rosary/bead-rose.png";
const ART = "/rosary/complete-mary-lamb.png";
const COOL_MS = 700;

function viewportNow(): Viewport {
  if (window.matchMedia("(max-width:639px)").matches) return "mobile";
  if (window.matchMedia("(min-width:1024px)").matches) return "desktop";
  return "tablet";
}

type Props = { open: boolean; onClose: () => void };

/** Full-screen interactive Rosary. Runs entirely in the browser. */
export function RosaryPrayer({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;
  return createPortal(<RosaryOverlay onClose={onClose} />, document.body);
}

function RosaryOverlay({ onClose }: { onClose: () => void }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [mode, setModeState] = useState<RosaryMode>(() => lastMode);
  const [set, setSet] = useState<MysterySet>(() => DAY_SET[new Date().getDay()]);
  const [decade, setDecade] = useState(0);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [menu, setMenu] = useState<"" | "mode" | "picker">("");
  const [openSets, setOpenSets] = useState<Partial<Record<MysterySet, boolean>>>({});
  const [flipped, setFlipped] = useState(false);
  const [cool, setCool] = useState(false);
  const [vp, setVp] = useState<Viewport>(() => viewportNow());
  const [scale, setScale] = useState(1);
  const [toast, setToast] = useState("");
  const today = useMemo(() => DAY_SET[new Date().getDay()], []);

  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const doneTitleRef = useRef<HTMLHeadingElement>(null);
  const flipBtnRef = useRef<HTMLButtonElement>(null);
  const unflipBtnRef = useRef<HTMLButtonElement>(null);
  const coolTimer = useRef<number | undefined>(undefined);

  const steps = useMemo(() => buildSteps(mode, decade), [mode, decade]);
  const st: RosaryStep = steps[Math.min(i, steps.length - 1)];
  const info = MYSTERIES[set];
  const my = info.list[st.d];
  const full = mode === "full";

  useEffect(() => { lastMode = mode; }, [mode]);

  // Keep the decade in step with where we are (Full walks through all five).
  const shownDecade = st.d;

  // Page behind the overlay: inert + no scroll, restore on close.
  useEffect(() => {
    const host = rootRef.current?.parentElement === document.body ? rootRef.current : null;
    const touched: Element[] = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === host || el.tagName === "SCRIPT" || el.hasAttribute("inert")) return;
      el.setAttribute("inert", ""); touched.push(el);
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (location.hash !== "#rosary") history.replaceState(history.state, "", "#rosary");
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      touched.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      if (location.hash === "#rosary") history.replaceState(history.state, "", location.pathname + location.search);
      window.clearTimeout(coolTimer.current);
    };
  }, []);

  const [fitTick, setFitTick] = useState(0);
  useEffect(() => {
    const onResize = () => { setVp(viewportNow()); setFitTick((n) => n + 1); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fit the rosary into the space left by the prayer card and buttons (side by side on desktop).
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || done) return;
    const cs = getComputedStyle(body);
    const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.rowGap || cs.gap) || 16;
    const cardMax = (frontRef.current && parseFloat(getComputedStyle(frontRef.current).maxHeight)) || 240;
    let availH = body.clientHeight - padV - gap * 2 - cardMax - (controlsRef.current?.offsetHeight ?? 0);
    let availW = body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (vp === "desktop") {
      const cg = parseFloat(cs.columnGap || cs.gap) || 64;
      availH = body.clientHeight - padV;
      availW = availW - (sideRef.current?.offsetWidth ?? 0) - cg;
    }
    const G1 = rosaryGeom(full, 1, vp); // 1px slack so sub-pixel sizes never add a scrollbar
    const s = Math.max(vp === "desktop" ? 0.4 : 0.6, Math.min(1, (availH - 1) / G1.h, availW / G1.w));
    setScale(s);
  }, [full, vp, done, fitTick]);

  const G = useMemo(() => rosaryGeom(full, scale, vp), [full, scale, vp]);

  const closeMenus = useCallback(() => setMenu(""), []);

  const startMode = (m: RosaryMode) => {
    setDecade(st.d); setModeState(m); setI(0); setDone(false); setMenu(""); setFlipped(false);
  };
  const pickMystery = (s: MysterySet, d: number) => {
    setSet(s); setDecade(d);
    const next = buildSteps(mode, d);
    let idx = 0;
    if (mode === "full") idx = next.findIndex((x) => !x.intro && x.d === d && x.k === "ann");
    else if (mode === "standard") idx = next.findIndex((x) => !x.intro && x.k === "ann");
    setI(Math.max(0, idx)); setMenu(""); setDone(false); setFlipped(false);
  };

  const finish = () => { setDone(true); setMenu(""); };
  const next = () => {
    if (cool) return;
    if (i >= steps.length - 1) { finish(); return; }
    setI(i + 1); setFlipped(false); setCool(true);
    window.clearTimeout(coolTimer.current);
    coolTimer.current = window.setTimeout(() => setCool(false), COOL_MS);
  };
  const prev = () => { if (i > 0) { setI(i - 1); setFlipped(false); } };
  const again = () => { setI(0); setDone(false); setFlipped(false); };

  useEffect(() => { if (done) doneTitleRef.current?.focus(); }, [done]);

  // Escape closes an open menu first, then the Rosary.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (menu) { setMenu(""); return; }
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, onClose]);

  const flip = (on: boolean) => {
    setFlipped(on);
    requestAnimationFrame(() => (on ? unflipBtnRef.current : flipBtnRef.current)?.focus());
  };

  const sendBlessing = async () => {
    const url = `${window.location.origin}/prayers#rosary`;
    const text = "I just prayed the Rosary! 📿 Pray with me:";
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "The Rosary", text, url }); return; }
      catch (e) { if (e instanceof DOMException && e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setToast("Link copied! Share it with someone you love.");
    } catch {
      setToast(url);
    }
    window.setTimeout(() => setToast(""), 2200);
  };

  const onOverlayClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (!t.closest(".rsy-popover") && !t.closest("[data-rsy-menu]")) closeMenus();
  };

  // Text in the centre of the circle (no pictures while praying).
  const intro = !!st.intro;
  const cap = intro ? "Opening prayers" : st.k === "hhq" ? "We finish with Mary" : my[2];
  let count = "";
  if (st.k === "soc") count = "Sign of the Cross";
  else if (st.k === "creed") count = "Apostles’ Creed";
  else if (st.k === "of") count = "Our Father";
  else if (st.k === "hm" && st.intro) count = `Hail Mary ${(st.b ?? 0) + 1} / 3`;
  else if (st.k === "hm") count = `Hail Mary ${(st.b ?? 0) + 1} / 10`;
  else if (st.k === "gb") count = "Glory Be";
  else if (st.k === "fat") count = "O My Jesus";
  else if (st.k === "ann") count = `The ${ORDINALS[st.d]} ${info.short} Mystery`;
  else if (st.k === "hhq") count = "Hail, Holy Queen";
  const showDec = full && !intro && st.k !== "hhq";

  const title = vp === "mobile" ? `${shownDecade + 1}. ${my[0]} ▾` : `${info.short} · ${shownDecade + 1}. ${my[0]} ▾`;
  const stepTitle = st.k === "ann" ? my[0] : PRAYERS[st.k].t;
  const isLast = i === steps.length - 1;

  return (
    <div
      ref={rootRef}
      className="rsy"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      onClick={onOverlayClick}
    >
      <div className="rsy-header">
        <div className="rsy-head-left">
          <button
            className="rsy-pill"
            type="button"
            data-rsy-menu
            aria-haspopup="listbox"
            aria-expanded={menu === "mode"}
            onClick={() => setMenu(menu === "mode" ? "" : "mode")}
          >
            <span className="rsy-lbl-full">{MODE_META[mode].full}</span>
            <span className="rsy-lbl-short">{MODE_META[mode].short}</span> ▾
          </button>
          <div className="rsy-popover" role="listbox" aria-label="How long to pray" hidden={menu !== "mode"}>
            {MODES.map((k) => (
              <button key={k} className="rsy-pop-item" type="button" role="option" aria-selected={mode === k} onClick={() => startMode(k)}>
                <span className="rsy-ck">{mode === k ? "✓" : ""}</span>
                {MODE_META[k].menu}
              </button>
            ))}
          </div>
        </div>
        <div className="rsy-head-center">
          <button
            id={`${uid}-title`}
            className="rsy-pill rsy-title-pill"
            type="button"
            data-rsy-menu
            aria-haspopup="dialog"
            aria-expanded={menu === "picker"}
            onClick={() => setMenu(menu === "picker" ? "" : "picker")}
          >
            {title}
          </button>
          <div className="rsy-popover" hidden={menu !== "picker"}>
            {menu === "picker" &&
              [today, ...SETS.filter((s) => s !== today)].map((key, n) => {
                const si = MYSTERIES[key];
                const isToday = key === today;
                const isOpen = isToday || !!openSets[key];
                return (
                  <div key={key}>
                    {n === 1 && <div className="rsy-pop-div" />}
                    {isToday ? (
                      <div className="rsy-pop-head">{si.emoji} Today ({si.when}) — {si.name}</div>
                    ) : (
                      <button
                        className="rsy-pop-row"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenSets((o) => ({ ...o, [key]: !o[key] }))}
                      >
                        {si.emoji} {si.when} — {si.name} <span aria-hidden>{isOpen ? "▾" : "▸"}</span>
                      </button>
                    )}
                    {isOpen &&
                      si.list.map((m, d) => (
                        <button key={d} className="rsy-pop-item" type="button" onClick={() => pickMystery(key, d)}>
                          <span className="rsy-ck">{set === key && shownDecade === d ? "✓" : ""}</span>
                          {d + 1}. {m[0]}
                        </button>
                      ))}
                  </div>
                );
              })}
          </div>
        </div>
        <button ref={closeRef} className="rsy-close" type="button" aria-label="Close Rosary" onClick={onClose}>
          ✕
        </button>
      </div>

      {!done ? (
        <div className="rsy-body" ref={bodyRef}>
          <RosaryMap G={G} uid={uid} steps={steps} i={i} mode={mode}>
            {showDec && <div className="rsy-dec-line">Decade {st.d + 1} of 5</div>}
            <div className="rsy-cap">{cap}</div>
            <div className="rsy-count">{count}</div>
          </RosaryMap>
          <div className="rsy-side" ref={sideRef}>
            <div className={`rsy-pcard ${flipped ? "is-flipped" : ""}`}>
              <div className="rsy-pinner">
                <div className="rsy-pface rsy-pfront" ref={frontRef} aria-hidden={flipped} inert={flipped ? true : undefined}>
                  <div className="rsy-scroll">
                    <CardFront st={st} set={set} />
                  </div>
                  <button ref={flipBtnRef} className="rsy-flipbtn" type="button" onClick={() => flip(true)}>
                    💡 Meaning ↻
                  </button>
                </div>
                <div className="rsy-pface rsy-pback" aria-hidden={!flipped} inert={!flipped ? true : undefined}>
                  <div className="rsy-scroll">
                    <p className="rsy-meaning">{st.k === "ann" ? my[3] : PRAYERS[st.k].kid}</p>
                    <div className="rsy-talk-lbl">Let&apos;s talk</div>
                    <p className="rsy-talk-q">{my[4]}</p>
                  </div>
                  <button ref={unflipBtnRef} className="rsy-flipbtn" type="button" onClick={() => flip(false)}>
                    Flip back ↻
                  </button>
                </div>
              </div>
            </div>
            <div className="rsy-controls" ref={controlsRef}>
              <button
                className="rsy-prev"
                type="button"
                aria-label="Previous step"
                style={{ visibility: i === 0 ? "hidden" : "visible" }}
                onClick={prev}
              >
                ‹
              </button>
              <button
                className={`rsy-tap ${cool ? "is-cool" : ""}`}
                type="button"
                aria-disabled={cool ? true : undefined}
                onClick={next}
              >
                <span className="rsy-fill" />
                <span className="rsy-tap-lbl">{isLast ? "🙏 Amen! Finish" : "🙏 Tap to Pray"}</span>
              </button>
            </div>
          </div>
          <div className="rsy-sr" aria-live="polite">
            {`${stepTitle}. Step ${i + 1} of ${steps.length}.`}
          </div>
        </div>
      ) : (
        <div className="rsy-done">
          <div className="rsy-done-art">
            <div className="rsy-art-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ART} alt="Mary holding a happy lamb" width={776} height={792} />
            </div>
            <div className="rsy-garland" aria-hidden>
              {Array.from({ length: 10 }, (_, n) => {
                const t = (n - 4.5) / 4.5;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={n}
                    src={ROSE}
                    alt=""
                    style={{ transform: `translateY(${(t * t * -9 + 9).toFixed(1)}px) rotate(${(t * 14).toFixed(0)}deg)` }}
                  />
                );
              })}
            </div>
          </div>
          <h2 tabIndex={-1} ref={doneTitleRef}>Amen! 🌟</h2>
          <div className="rsy-acts">
            <button className="rsy-act" type="button" onClick={again}>🔄 Pray Again</button>
            <button className="rsy-act" type="button" onClick={sendBlessing}>💌 Send Blessing</button>
          </div>
        </div>
      )}
      {toast && <div className="rsy-toast" role="status">{toast}</div>}
    </div>
  );
}

/** Remembers the last chosen length while the page stays open. */
let lastMode: RosaryMode = "mini";

function CardFront({ st, set }: { st: RosaryStep; set: MysterySet }) {
  const info = MYSTERIES[set];
  const my = info.list[st.d];
  if (st.k === "ann") {
    return (
      <>
        <p className="rsy-leader">
          The {ORDINALS[st.d]} {info.name.replace("Mysteries", "Mystery")}: <strong>{my[0]}</strong>.
        </p>
        <p className="rsy-resp">Let&apos;s picture it in our hearts.</p>
      </>
    );
  }
  const p = PRAYERS[st.k];
  if (p.all) return <p className={`rsy-resp rsy-solo${p.all.length > 180 ? " is-long" : ""}`}>{p.all}</p>;
  return (
    <>
      <p className="rsy-leader">{p.lead}</p>
      <p className="rsy-resp">{p.resp}</p>
    </>
  );
}

function RosaryMap({
  G, uid, steps, i, mode, children,
}: { G: RosaryGeom; uid: string; steps: RosaryStep[]; i: number; mode: RosaryMode; children: React.ReactNode }) {
  const full = G.full, c = G.c;
  const cur = beadKey(steps[i], mode);
  const prayed = new Set<string>();
  for (let j = 0; j < i; j++) if (steps[j].k === "hm") prayed.add(beadKey(steps[j], mode));
  const dim = new Set(mode === "mini" ? ["of", "i0", "i1", "i2"] : []);
  const f = (v: number) => v.toFixed(1);

  const pt = (cls: string, p: RosaryPoint, w: number, h: number, inner?: React.ReactNode, dimmable = true) => (
    <span
      key={p.key}
      data-key={p.key}
      className={`rsy-pt ${cls}${p.key === cur ? " is-cur" : ""}${dimmable && dim.has(p.key) ? " is-dim" : ""}`}
      style={{ left: `${f(p.x)}px`, top: `${f(p.y)}px`, width: `${f(w)}px`, height: `${f(h)}px`, margin: `${f(-h / 2)}px 0 0 ${f(-w / 2)}px` }}
    >
      {inner}
    </span>
  );
  // eslint-disable-next-line @next/next/no-img-element
  const rose = <img src={ROSE} alt="" />;

  return (
    <div className={`rsy-map${full ? " rsy-map--full" : ""}`} style={{ width: `${G.w}px`, height: `${G.h}px` }}>
      <svg className="rsy-cord" viewBox={`0 0 ${f(G.w)} ${f(G.h)}`} aria-hidden="true">
        <defs>
          <linearGradient id={`cord-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6b7cc" /><stop offset="45%" stopColor="#cbb6e0" /><stop offset="100%" stopColor="#e3c0d4" />
          </linearGradient>
        </defs>
        <circle cx={f(G.cx)} cy={f(G.cy)} r={f(G.R)} fill="none" stroke="#f4e4ee" strokeWidth={f(c.haloW)} />
        <circle cx={f(G.cx)} cy={f(G.cy)} r={f(G.R)} fill="none" stroke={`url(#cord-${uid})`} strokeWidth={f(c.cordW)} />
        {full && (
          <>
            <line x1={f(G.cx)} y1={f(G.cy + G.R)} x2={f(G.cx)} y2={f(G.cross.y - c.crossH * 0.3)} stroke="#f4e4ee" strokeWidth={f(c.haloW)} strokeLinecap="round" />
            <line x1={f(G.cx)} y1={f(G.cy + G.R)} x2={f(G.cx)} y2={f(G.cross.y - c.crossH * 0.3)} stroke={`url(#cord-${uid})`} strokeWidth={f(c.cordW)} strokeLinecap="round" />
          </>
        )}
        {G.spark.map((s, n) => (
          <path
            key={n}
            transform={`translate(${s.x - 7},${s.y - 7}) scale(${(s.sc || 1) * 0.9})`}
            d="M8 0 L9.7 6.1 L16 8 L9.7 9.9 L8 16 L6.3 9.9 L0 8 L6.3 6.1 Z"
            fill="#E8C86A"
            opacity={s.o || 0.8}
          />
        ))}
      </svg>
      <div aria-hidden="true">
        {G.pts.map((p) => {
          if (p.type === "bead") {
            const isDone = prayed.has(p.key);
            if (!full) return pt(`rsy-bead${isDone ? " is-prayed" : ""}`, p, c.bead, c.bead);
            return isDone ? pt("rsy-bead is-rose", p, c.rose, c.rose, rose) : pt("rsy-bead", p, c.bead, c.bead);
          }
          if (p.type === "rosemark") return pt("rsy-bead is-rose rsy-rosemark", p, c.big * 1.12, c.big * 1.12, rose);
          if (p.type === "big") return pt("rsy-big", p, c.big, c.big);
          if (p.type === "medal")
            return pt("rsy-medal", p, full ? c.cpW : c.medW, full ? c.cpH : c.medH, <MedalSvg id={`med-${uid}`} />, false);
          return pt("rsy-xbead", p, c.crossW, c.crossH, <CrossSvg id={`wood-${uid}`} />, false);
        })}
      </div>
      <div
        className="rsy-center"
        style={{ left: `${G.cx}px`, top: `${G.cy}px`, width: `${Math.max(140, 2 * (G.R - c.rose / 2) - (full ? 34 : 40))}px` }}
      >
        {children}
      </div>
    </div>
  );
}

function MedalSvg({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 28 36" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff3cc" /><stop offset="55%" stopColor="#e8c86a" /><stop offset="100%" stopColor="#c9a24a" />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="18" rx="11.5" ry="15" fill={`url(#${id})`} stroke="#9a7430" strokeWidth="1.6" />
      <ellipse cx="14" cy="18" rx="8" ry="11.2" fill="none" stroke="#f0e0a8" strokeWidth="1.1" />
      <path d="M14 13.2c1.7-2.2 5.2-1.4 5.2 1.6 0 3.4-5.2 6.2-5.2 6.2S8.8 18.2 8.8 14.8c0-3 3.5-3.8 5.2-1.6z" fill="#e87890" stroke="#b14a62" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

function CrossSvg({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 32 44" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d59a" /><stop offset="50%" stopColor="#d4a85a" /><stop offset="100%" stopColor="#b8863a" />
        </linearGradient>
      </defs>
      <rect x="12.2" y="1.5" width="7.6" height="40" rx="2.2" fill={`url(#${id})`} stroke="#8a6230" strokeWidth="1.3" />
      <rect x="2" y="11" width="28" height="7.6" rx="2.2" fill={`url(#${id})`} stroke="#8a6230" strokeWidth="1.3" />
      <circle cx="16" cy="14.8" r="2.1" fill="#f5e4b0" stroke="#8a6230" strokeWidth="0.7" />
    </svg>
  );
}

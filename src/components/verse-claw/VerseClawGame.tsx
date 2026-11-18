"use client";

import { fredoka } from "@/components/liturgy/fredoka";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import {
  dollBySlot,
  nearestDollSlot,
  slotClawTarget,
  VERSE_CLAW_DOLLS,
  VERSE_CLAW_FELT_BALLS,
  type VerseClawDoll,
} from "@/lib/verse-claw/dolls";
import { pickVerseForDoll, type VerseClawVerse } from "@/lib/verse-claw/verses";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import "./verse-claw.css";

type Phase = "idle" | "drop" | "close" | "lift" | "dispense" | "won";

const STEP = 8;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pileStyle(doll: VerseClawDoll): CSSProperties {
  const { left, bottom, rotate, z, width } = doll.pile;
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    width: `${width}%`,
    zIndex: z,
    transform: `rotate(${rotate}deg)`,
  };
}

function Bokeh() {
  const bits = [
    { left: "8%", top: "12%", size: 18, color: "#ffd27a", delay: "0s" },
    { left: "78%", top: "18%", size: 14, color: "#ffb0b8", delay: "0.4s" },
    { left: "18%", top: "72%", size: 22, color: "#ffe29a", delay: "0.8s" },
    { left: "86%", top: "68%", size: 16, color: "#ffc4a8", delay: "1.1s" },
    { left: "48%", top: "8%", size: 10, color: "#fff", delay: "0.2s" },
    { left: "62%", top: "84%", size: 12, color: "#ffd0d4", delay: "1.4s" },
  ];
  return (
    <div className="vc-bokeh" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: b.color,
            animationDelay: b.delay,
            borderRadius: i % 2 ? "50%" : "30% 70% 70% 30%",
          }}
        />
      ))}
    </div>
  );
}

function ToyClaw({
  open,
  held,
  moving,
}: {
  open: boolean;
  held: VerseClawDoll | null;
  moving: boolean;
}) {
  return (
    <div
      className={`vc-claw ${open ? "vc-claw--open" : "vc-claw--closed"}${moving ? " vc-claw--moving" : ""}`}
      aria-hidden="true"
    >
      <div className="vc-claw-spring" />
      <div className="vc-claw-head">
        <div className="vc-claw-face">
          <span className="vc-claw-eye vc-claw-eye--l" />
          <span className="vc-claw-eye vc-claw-eye--r" />
          <span className="vc-claw-blush vc-claw-blush--l" />
          <span className="vc-claw-blush vc-claw-blush--r" />
          <span className="vc-claw-smile" />
        </div>
      </div>
      <div className="vc-prongs" aria-hidden="true">
        {/* Thick stroked arcs = soft toy claw toes that clearly curve. */}
        <svg className="vc-toe vc-toe--l" viewBox="0 0 64 84" preserveAspectRatio="xMidYMin meet">
          <path className="vc-toe-arc" d="M38 8 C 6 22, -2 48, 24 74" />
          <circle className="vc-toe-tip" cx="24" cy="74" r="8" />
        </svg>
        <svg className="vc-toe vc-toe--c" viewBox="0 0 64 84" preserveAspectRatio="xMidYMin meet">
          <path className="vc-toe-arc" d="M32 6 C 26 28, 26 50, 32 74" />
          <circle className="vc-toe-tip" cx="32" cy="74" r="8" />
        </svg>
        <svg className="vc-toe vc-toe--r" viewBox="0 0 64 84" preserveAspectRatio="xMidYMin meet">
          <path className="vc-toe-arc" d="M26 8 C 58 22, 66 48, 40 74" />
          <circle className="vc-toe-tip" cx="40" cy="74" r="8" />
        </svg>
      </div>
      {held ? (
        <div className="vc-held-doll">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={held.src} alt="" draggable={false} />
        </div>
      ) : null}
    </div>
  );
}

export function VerseClawGame() {
  const [clawX, setClawX] = useState(42);
  const [clawZ, setClawZ] = useState(55);
  const [phase, setPhase] = useState<Phase>("idle");
  const [caught, setCaught] = useState<VerseClawDoll | null>(null);
  const [held, setHeld] = useState<VerseClawDoll | null>(null);
  const [verse, setVerse] = useState<VerseClawVerse | null>(null);
  const [goneSlot, setGoneSlot] = useState<number | null>(null);
  const [shareMsg, setShareMsg] = useState("");
  const [moving, setMoving] = useState(false);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);
  const moveTimer = useRef<number | null>(null);

  const busy = phase !== "idle" && phase !== "won";
  const fingersOpen = phase === "idle" || phase === "drop";

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (moveTimer.current) window.clearTimeout(moveTimer.current);
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function pulseMove() {
    setMoving(true);
    if (moveTimer.current) window.clearTimeout(moveTimer.current);
    moveTimer.current = window.setTimeout(() => setMoving(false), 280);
  }

  function nudge(dx: number, dz: number) {
    if (busy) return;
    pulseMove();
    setClawX((x) => clamp(x + dx, 12, 88));
    setClawZ((z) => clamp(z + dz, 12, 92));
  }

  function grab() {
    if (busy || phase === "won") return;
    clearTimers();
    const slot = nearestDollSlot(clawX, clawZ);
    const target = slotClawTarget(slot);
    const doll = dollBySlot(slot);
    setClawX(target.x);
    setClawZ(target.z);
    setCaught(doll);
    setPhase("drop");

    // Descend onto pile, then close fingers around the doll, lift it out.
    later(700, () => {
      setHeld(doll);
      setGoneSlot(slot);
      setPhase("close");
    });
    later(1100, () => setPhase("lift"));
    later(1650, () => {
      setHeld(null);
      setPhase("dispense");
    });
    later(2400, () => {
      setVerse(pickVerseForDoll(doll.id));
      setPhase("won");
    });
  }

  const nudgeRef = useRef(nudge);
  const grabRef = useRef(grab);
  nudgeRef.current = nudge;
  grabRef.current = grab;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target;
      if (el instanceof HTMLElement) {
        const tag = el.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return;
      }
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          nudgeRef.current(-STEP, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          nudgeRef.current(STEP, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          nudgeRef.current(0, STEP);
          break;
        case "ArrowDown":
          e.preventDefault();
          nudgeRef.current(0, -STEP);
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          grabRef.current();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function playAgain() {
    clearTimers();
    setPhase("idle");
    setCaught(null);
    setHeld(null);
    setVerse(null);
    setGoneSlot(null);
    setShareMsg("");
    setClawX(42);
    setClawZ(55);
  }

  async function shareWithFamily() {
    if (!verse || !caught) return;
    const url = typeof window !== "undefined" ? window.location.href : "https://catholickidscrafts.com/play/verse-claw";
    const text = `${caught.name} brought ${verse.ref}: “${verse.text}” — a blessing from Verse Claw at Catholic Kids Crafts`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "You caught a blessing!", text, url });
        setShareMsg("Shared with love!");
        return;
      }
    } catch {
      /* cancelled */
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg("Copied — paste it for your family!");
    } catch {
      setShareMsg("Copy this verse and share it with your family.");
    }
  }

  // Mild depth cue only — avoid dramatic shrink/grow while moving.
  const depthScale = 0.94 + (clawZ / 100) * 0.1;
  // Positions are % of cabinet height (must use `%` in styles — bare numbers become px).
  // Idle hang stays high; drop/close sinks prongs into the plush pile near the floor.
  const hangTop = Math.max(1.5, (100 - clawZ) * 0.12);
  // Deep enough that prongs dig into the lower doll band (~floor).
  const dropTop = 74 + (100 - clawZ) * 0.08;
  let clawTop = hangTop;
  if (phase === "drop" || phase === "close") clawTop = Math.min(82, dropTop);
  else if (phase === "lift") clawTop = hangTop + 16;
  else if (phase === "dispense") clawTop = hangTop + 6;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (busy || phase === "won") return;
    swipeRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!swipeRef.current || busy || phase === "won") return;
    const dx = e.clientX - swipeRef.current.x;
    const dy = e.clientY - swipeRef.current.y;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) >= Math.abs(dy)) nudge(dx > 0 ? STEP : -STEP, 0);
    else nudge(0, dy > 0 ? STEP : -STEP);
    swipeRef.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp() {
    swipeRef.current = null;
  }

  const bibleHref =
    verse != null ? readHrefForDouay(verse.bookSlug, verse.chapter, verse.verse) : "/bible";

  return (
    <div className={`vc-game ${fredoka.variable}`}>
      <div className="vc-machine" data-phase={phase}>
        <div className="vc-sign">
          <strong>Verse Claw</strong>
        </div>

        <div
          className="vc-cabinet"
          role="application"
          aria-label="Verse claw machine"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="vc-rail" aria-hidden="true" />
          <div className="vc-trolley" style={{ left: `${clawX}%` }} aria-hidden="true" />
          <div
            className="vc-cable"
            aria-hidden="true"
            style={{ left: `${clawX}%`, height: `calc(${clawTop}% - 12px)` }}
          />
          <div
            className="vc-claw-anchor"
            style={{
              left: `${clawX}%`,
              top: `${clawTop}%`,
              transform: `scale(${depthScale})`,
            }}
          >
            <ToyClaw open={fingersOpen} held={held} moving={moving && phase === "idle"} />
          </div>

          <div className="vc-floor" aria-hidden="true" />
          <div className="vc-chute" aria-hidden="true" />

          <div className="vc-dolls">
            {VERSE_CLAW_FELT_BALLS.map((ball, i) => (
              <div
                key={`felt-${i}`}
                className="vc-felt"
                style={{
                  left: `${ball.left}%`,
                  bottom: `${ball.bottom}%`,
                  width: `${ball.size}%`,
                  zIndex: ball.z,
                  transform: `rotate(${ball.rotate}deg)`,
                }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ball.src} alt="" draggable={false} />
              </div>
            ))}
            {VERSE_CLAW_DOLLS.map((doll) => {
              const gone = goneSlot === doll.slot;
              const prize = phase === "dispense" && caught?.slot === doll.slot;
              return (
                <div
                  key={doll.slot}
                  className={`vc-doll${gone && !prize ? " vc-doll--gone" : ""}${prize ? " vc-doll--prize" : ""}`}
                  style={pileStyle(doll)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={doll.src} alt={doll.name} draggable={false} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="vc-controls">
          <div className="vc-dpad" role="group" aria-label="Move claw">
            <span className="vc-dpad-empty" />
            <button type="button" aria-label="Move claw forward" disabled={busy} onClick={() => nudge(0, STEP)}>
              ▲
            </button>
            <span className="vc-dpad-empty" />
            <button type="button" aria-label="Move claw left" disabled={busy} onClick={() => nudge(-STEP, 0)}>
              ◀
            </button>
            <button type="button" aria-label="Claw position" disabled title="Claw position">
              ●
            </button>
            <button type="button" aria-label="Move claw right" disabled={busy} onClick={() => nudge(STEP, 0)}>
              ▶
            </button>
            <span className="vc-dpad-empty" />
            <button type="button" aria-label="Move claw back" disabled={busy} onClick={() => nudge(0, -STEP)}>
              ▼
            </button>
            <span className="vc-dpad-empty" />
          </div>

          <button type="button" className="vc-grab" disabled={busy} onClick={grab}>
            Grab!
          </button>
        </div>
      </div>

      {phase === "won" && caught && verse ? (
        <div className="vc-overlay" role="dialog" aria-modal="true" aria-labelledby="vc-win-title">
          <Bokeh />
          <div className="vc-popup">
            <div className="vc-popup-hero">
              <span className="vc-hero-glow" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={caught.src} alt="" />
            </div>
            <h2 id="vc-win-title" className="vc-win-title">
              <span className="vc-you-caught">You caught</span>
              <span className="vc-a-blessing">a blessing!</span>
            </h2>
            <span className="vc-caught-pill">
              {caught.name} · {verse.ref}
            </span>
            <div className="vc-verse-recess">
              <p className="vc-ref">† {verse.ref} †</p>
              <blockquote>{verse.text}</blockquote>
            </div>
            <div className="vc-quote-bubble">
              <p>{verse.keepnote}</p>
            </div>
            <div className="vc-actions">
              <button type="button" className="vc-btn-again" onClick={playAgain}>
                Play again
              </button>
              <Link href={bibleHref} className="vc-btn-bible">
                Open Bible
              </Link>
              <button type="button" className="vc-btn-share" onClick={shareWithFamily}>
                Share with family
              </button>
            </div>
            <p className="vc-share-msg" aria-live="polite">
              {shareMsg}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

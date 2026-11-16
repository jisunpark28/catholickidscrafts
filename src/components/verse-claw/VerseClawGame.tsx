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
const WIN_LAMB = "/games/verse-claw/win-lamb.png";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pileStyle(doll: VerseClawDoll): CSSProperties {
  const { left, bottom, rotate, scale, z, width } = doll.pile;
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    width: `${width}%`,
    zIndex: z,
    transform: `rotate(${rotate}deg) scale(${scale})`,
  };
}

function IconClaw() {
  return (
    <svg className="vc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="3" width="12" height="14" rx="2" fill="#5c3d2e" opacity="0.9" />
      <path d="M12 7v5M9 14c0-2 1.5-3 3-3s3 1 3 3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="4" y="17" width="16" height="4" rx="1.5" fill="#5c3d2e" />
    </svg>
  );
}

function IconBible() {
  return (
    <svg className="vc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z" fill="#8b5a2b" />
      <path d="M7 6h9v12H7.8A2.8 2.8 0 0 0 5 20.8V8a2 2 0 0 1 2-2Z" fill="#f5e6b8" />
      <path d="M11.2 9.2v6M8.8 11.5h4.8" stroke="#8b5a2b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg className="vc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7-4.2-7-9.2A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7 3.6C19 16.8 12 21 12 21Z"
        fill="#fff"
        stroke="#5c3d2e"
        strokeWidth="1.2"
      />
      <circle cx="10" cy="12.2" r="1.3" fill="#5c3d2e" />
      <circle cx="14" cy="12.2" r="1.3" fill="#5c3d2e" />
      <path d="M10 14.2c.7.6 2.3.6 3 0" stroke="#5c3d2e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
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
      <div className="vc-prongs">
        <span className="vc-prong vc-prong--l" />
        <span className="vc-prong vc-prong--c" />
        <span className="vc-prong vc-prong--r" />
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

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (moveTimer.current) window.clearTimeout(moveTimer.current);
    };
  }, []);

  const busy = phase !== "idle" && phase !== "won";
  const fingersOpen = phase === "idle" || phase === "drop";

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
    later(420, () => {
      setHeld(doll);
      setGoneSlot(slot);
      setPhase("close");
    });
    later(780, () => setPhase("lift"));
    later(1280, () => {
      setHeld(null);
      setPhase("dispense");
    });
    later(2100, () => {
      setVerse(pickVerseForDoll(doll.id));
      setPhase("won");
    });
  }

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

  const depthScale = 0.78 + (clawZ / 100) * 0.42;
  // Idle/move hang height; drop reaches into the pile so prongs overlap the doll.
  const hangTop = 10 + (100 - clawZ) * 0.38;
  const dropReach = 58 + (100 - clawZ) * 0.55;
  let clawTop = hangTop;
  if (phase === "drop" || phase === "close") clawTop = hangTop + dropReach;
  else if (phase === "lift") clawTop = hangTop + 18;
  else if (phase === "dispense") clawTop = hangTop + 8;

  const cableHeight = Math.max(12, clawTop - 8);

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
          <span>Move the claw · Grab a blessing doll</span>
        </div>

        <div
          className="vc-cabinet"
          role="application"
          aria-label="Verse claw machine. Use the D-pad or swipe to move, then Grab."
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
            style={{ left: `${clawX}%`, height: cableHeight }}
          />
          <div
            className="vc-claw-anchor"
            style={{
              left: `${clawX}%`,
              top: clawTop,
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
                  key={doll.id}
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

          <p className="vc-hint">D-pad or swipe: left / right / forward / back · then Grab</p>
        </div>
      </div>

      {phase === "won" && caught && verse ? (
        <div className="vc-overlay" role="dialog" aria-modal="true" aria-labelledby="vc-win-title">
          <Bokeh />
          <div className="vc-popup">
            <div className="vc-popup-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WIN_LAMB} alt="" />
              <span className="vc-spark vc-spark--a">★</span>
              <span className="vc-spark vc-spark--b">♥</span>
              <span className="vc-spark vc-spark--c">✦</span>
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
                <IconClaw />
                Play again
              </button>
              <Link href={bibleHref} className="vc-btn-bible">
                <IconBible />
                Open Bible
              </Link>
              <button type="button" className="vc-btn-share" onClick={shareWithFamily}>
                <IconShare />
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

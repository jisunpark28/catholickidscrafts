"use client";

import { fredoka } from "@/components/liturgy/fredoka";
import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import {
  dollBySlot,
  nearestDollSlot,
  slotClawTarget,
  VERSE_CLAW_DOLLS,
  type VerseClawDoll,
} from "@/lib/verse-claw/dolls";
import { pickVerseForDoll, type VerseClawVerse } from "@/lib/verse-claw/verses";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import "./verse-claw.css";

type Phase = "idle" | "drop" | "close" | "lift" | "dispense" | "won";

const STEP = 8;
const CLAW_SRC = "/games/verse-claw/claw.jpg";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dollStyle(slot: number): CSSProperties {
  const col = slot % 4;
  const row = Math.floor(slot / 4);
  const left = 10 + col * 22;
  const bottom = row === 0 ? 28 : 8;
  const rot = ((slot * 17) % 7) - 3;
  const scale = row === 0 ? 0.92 : 1.05;
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    transform: `rotate(${rot}deg) scale(${scale})`,
  };
}

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="vc-confetti" aria-hidden="true">
      {bits.map((i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: i % 3 === 0 ? "#f07a3a" : i % 3 === 1 ? "#e8878a" : "#e8b84a",
            animationDelay: `${(i % 7) * 0.18}s`,
            width: i % 2 ? 8 : 12,
            height: i % 2 ? 8 : 12,
          }}
        />
      ))}
    </div>
  );
}

export function VerseClawGame() {
  const [clawX, setClawX] = useState(42);
  const [clawZ, setClawZ] = useState(55);
  const [phase, setPhase] = useState<Phase>("idle");
  const [caught, setCaught] = useState<VerseClawDoll | null>(null);
  const [verse, setVerse] = useState<VerseClawVerse | null>(null);
  const [goneSlot, setGoneSlot] = useState<number | null>(null);
  const [shareMsg, setShareMsg] = useState("");
  const cabinetRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const busy = phase !== "idle" && phase !== "won";

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function nudge(dx: number, dz: number) {
    if (busy) return;
    setClawX((x) => clamp(x + dx, 12, 88));
    setClawZ((z) => clamp(z + dz, 12, 92));
  }

  function grab() {
    if (busy || phase === "won") return;
    clearTimers();
    const slot = nearestDollSlot(clawX, clawZ);
    const target = slotClawTarget(slot);
    setClawX(target.x);
    setClawZ(target.z);
    setPhase("drop");

    later(380, () => setPhase("close"));
    later(720, () => {
      setGoneSlot(slot);
      setPhase("lift");
    });
    later(1100, () => {
      const doll = dollBySlot(slot);
      setCaught(doll);
      setPhase("dispense");
    });
    later(1950, () => {
      const doll = dollBySlot(slot);
      setVerse(pickVerseForDoll(doll.id));
      setPhase("won");
    });
  }

  function playAgain() {
    clearTimers();
    setPhase("idle");
    setCaught(null);
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
      /* user cancelled or share failed — fall through */
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg("Copied — paste it for your family!");
    } catch {
      setShareMsg("Copy this verse and share it with your family.");
    }
  }

  const depthScale = 0.82 + (clawZ / 100) * 0.38;
  const clawTop = 14 + (100 - clawZ) * 0.42;
  const dropExtra = phase === "drop" || phase === "close" ? 72 + (100 - clawZ) * 0.35 : 0;
  const cableHeight = Math.max(8, clawTop + dropExtra - 14);

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
    if (Math.abs(dx) >= Math.abs(dy)) {
      nudge(dx > 0 ? STEP : -STEP, 0);
    } else {
      // swipe down = forward (toward player / larger depth)
      nudge(0, dy > 0 ? STEP : -STEP);
    }
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
          ref={cabinetRef}
          className="vc-cabinet"
          role="application"
          aria-label="Verse claw machine. Use the D-pad or swipe to move, then Grab."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="vc-rail" aria-hidden="true" />
          <div
            className="vc-cable"
            aria-hidden="true"
            style={{
              left: `${clawX}%`,
              height: cableHeight,
              opacity: phase === "lift" || phase === "dispense" ? 0.85 : 1,
            }}
          />
          <div
            className={`vc-claw ${phase === "close" || phase === "lift" || phase === "dispense" ? "vc-claw--closed" : "vc-claw--open"}`}
            style={{
              left: `${clawX}%`,
              top: clawTop + dropExtra,
              transform: `scale(${depthScale})`,
            }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CLAW_SRC} alt="" draggable={false} />
          </div>

          <div className="vc-floor" aria-hidden="true" />
          <div className="vc-chute" aria-hidden="true" />

          <div className="vc-dolls">
            {VERSE_CLAW_DOLLS.map((doll) => {
              const gone = goneSlot === doll.slot;
              const prize = phase === "dispense" && caught?.slot === doll.slot;
              return (
                <div
                  key={doll.id}
                  className={`vc-doll${gone && !prize ? " vc-doll--gone" : ""}${prize ? " vc-doll--prize" : ""}`}
                  style={{
                    ...dollStyle(doll.slot),
                    ["--vc-glow" as string]: doll.glow,
                  }}
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
          <div className="vc-popup">
            <Confetti />
            <div className="vc-popup-doll">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={caught.src} alt={caught.name} />
            </div>
            <span className="vc-badge">You caught a blessing!</span>
            <h2 id="vc-win-title">
              {caught.name} brings {verse.ref}
            </h2>
            <div className="vc-verse-card">
              <p className="vc-ref">† {verse.ref} †</p>
              <blockquote>“{verse.text}”</blockquote>
            </div>
            <p className="vc-keepnote">{verse.keepnote}</p>
            <div className="vc-actions">
              <button type="button" className="vc-btn-share" onClick={shareWithFamily}>
                Share with family
              </button>
              <Link href={bibleHref} className="vc-btn-bible">
                Open in Bible
              </Link>
              <button type="button" className="vc-btn-again" onClick={playAgain}>
                Play again
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

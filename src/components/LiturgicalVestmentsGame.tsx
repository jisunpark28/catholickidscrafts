"use client";

import { useMemo, useState } from "react";
import {
  shuffleRounds,
  VESTMENT_COLORS,
  type VestmentColor,
} from "@/lib/liturgical-vestments-game";

const PRIEST_IMG = "/games/tiny-priest/assets/priest_front.png";

type Feedback = "idle" | "correct" | "wrong";

export function LiturgicalVestmentsGame() {
  const [rounds, setRounds] = useState(() => shuffleRounds(6));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<VestmentColor | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [done, setDone] = useState(false);

  const round = rounds[index];
  const colorHex = selected ? VESTMENT_COLORS[selected].hex : "transparent";
  const colorStroke = selected ? VESTMENT_COLORS[selected].stroke : "#333";

  const progress = useMemo(
    () => ({ current: Math.min(index + 1, rounds.length), total: rounds.length }),
    [index, rounds.length],
  );

  function checkAnswer() {
    if (!round || !selected) return;
    if (selected === round.correctColor) {
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      setFeedback("wrong");
    }
  }

  function nextRound() {
    setSelected(null);
    setFeedback("idle");
    if (index + 1 >= rounds.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function restart() {
    setRounds(shuffleRounds(6));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback("idle");
    setDone(false);
  }

  if (done) {
    return (
      <div className="border border-[var(--color-border)] bg-white p-8 text-center">
        <p className="text-2xl font-bold text-[var(--color-ink)]">Well done!</p>
        <p className="mt-2 text-lg text-[var(--color-muted)]">
          You dressed Father correctly {score} of {rounds.length} times.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-6 bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white"
        >
          Play again
        </button>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
        <span className="font-semibold">
          Round {progress.current} / {progress.total}
        </span>
        <span className="font-semibold">Score: {score}</span>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">{round.title}</h2>
          <p className="mt-2 text-[var(--color-muted)]">{round.description}</p>
          {round.hint && (
            <p className="mt-1 text-sm text-[var(--color-muted)]">💡 {round.hint}</p>
          )}

          <p className="mt-4 text-sm font-semibold text-[var(--color-ink)]">
            Tap a liturgical color, then dress Father:
          </p>

          <div className="relative mx-auto mt-4 w-full max-w-[300px]">
            <img
              src={PRIEST_IMG}
              alt="Priest ready for vestments"
              className="block w-full select-none"
              draggable={false}
            />
            <svg
              viewBox="0 0 100 200"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            >
              {/* Stole */}
              <path
                d="M46 38 L54 38 L58 52 L52 58 L50 95 L48 58 L42 52 Z"
                fill={selected ? colorHex : "none"}
                fillOpacity={selected ? 0.92 : 0}
                stroke={colorStroke}
                strokeWidth={selected ? 0.6 : 0}
              />
              {/* Chasuble */}
              <path
                d="M22 72 C35 62 65 62 78 72 L86 138 C65 152 35 152 14 138 Z"
                fill={selected ? colorHex : "none"}
                fillOpacity={selected ? 0.88 : 0}
                stroke={colorStroke}
                strokeWidth={selected ? 0.8 : 0}
              />
            </svg>
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">Liturgical colors</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(VESTMENT_COLORS) as VestmentColor[]).map((key) => {
                const c = VESTMENT_COLORS[key];
                const active = selected === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelected(key);
                      setFeedback("idle");
                    }}
                    className={`flex items-center gap-2 border px-3 py-2 text-left text-sm font-semibold transition ${
                      active ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]" : "border-[var(--color-border)]"
                    }`}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border"
                      style={{ background: c.hex, borderColor: c.stroke }}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={checkAnswer}
            disabled={!selected}
            className="w-full bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Check vestments
          </button>

          {feedback === "correct" && (
            <div className="border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900">
              <p className="font-bold">Correct!</p>
              <p className="mt-1">
                {VESTMENT_COLORS[round.correctColor].label} is right for {round.title}.
              </p>
              <button
                type="button"
                onClick={nextRound}
                className="mt-3 w-full border border-green-700 bg-white py-2 font-bold text-green-900"
              >
                Next →
              </button>
            </div>
          )}

          {feedback === "wrong" && (
            <div className="border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
              <p className="font-bold">Not quite.</p>
              <p className="mt-1">
                This time of year uses{" "}
                <strong>{VESTMENT_COLORS[round.correctColor].label}</strong> vestments.
              </p>
              <button
                type="button"
                onClick={nextRound}
                className="mt-3 w-full border border-amber-800 bg-white py-2 font-bold"
              >
                Try next round →
              </button>
            </div>
          )}

          <p className="text-xs text-[var(--color-muted)]">
            Green = Ordinary Time · Purple = Advent & Lent · White = Christmas & Easter · Red =
            Pentecost & martyrs · Rose = special joyful Sundays
          </p>
        </aside>
      </div>
    </div>
  );
}

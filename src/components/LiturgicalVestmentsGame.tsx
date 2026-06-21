"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { PriestVestmentFigure } from "@/components/liturgical-vestments/PriestVestmentFigure";
import {
  formatVestmentRoundQuestion,
  shuffleRounds,
  VESTMENT_COLORS,
  VESTMENT_ROUND_COPY_KEY,
  VESTMENT_ROUND_QUESTION_FALLBACK,
  VESTMENT_ROUND_QUESTION_KEY,
  type VestmentColor,
} from "@/lib/liturgical-vestments-game";
import { useMemo, useState } from "react";

const COLOR_ORDER: VestmentColor[] = [
  "white",
  "red",
  "purple",
  "lavender",
  "green",
  "rose",
];

type Feedback = "idle" | "correct" | "wrong";

export function LiturgicalVestmentsGame() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
  const [rounds, setRounds] = useState(() => shuffleRounds());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<VestmentColor | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [done, setDone] = useState(false);

  const round = rounds[index];

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
    setRounds(shuffleRounds());
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

  const occasion = t(VESTMENT_ROUND_COPY_KEY[round.id] ?? "", round.title);
  const roundQuestion = formatVestmentRoundQuestion(
    occasion,
    t(VESTMENT_ROUND_QUESTION_KEY, VESTMENT_ROUND_QUESTION_FALLBACK),
  );

  return (
    <div className="border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
        <span className="font-semibold">
          Round {progress.current} / {progress.total}
        </span>
        <span className="font-semibold">Score: {score}</span>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">{roundQuestion}</h2>

          <div className="mt-4 flex justify-center overflow-visible pt-1">
            <PriestVestmentFigure chasubleColor={selected} />
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">Liturgical colors</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COLOR_ORDER.map((key) => {
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
                      active
                        ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border"
                      style={{ background: c.hex, borderColor: c.stroke }}
                    />
                    {t(`play.vestments.color.${key}`, c.label)}
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

        </aside>
      </div>
    </div>
  );
}

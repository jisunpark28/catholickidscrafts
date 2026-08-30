"use client";

import { MASS_ORDER_GESTURES } from "@/lib/mass-order-gestures";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type MassOrderStepRow = {
  id?: string;
  stepIndex: number;
  part: string;
  partEn: string;
  title: string;
  text: string;
  gesture: string;
  published: boolean;
};

type Props = { initialSteps: MassOrderStepRow[] };

function groupByPart(steps: MassOrderStepRow[]) {
  const groups: { key: string; part: string; partEn: string; steps: MassOrderStepRow[] }[] = [];
  const map = new Map<string, (typeof groups)[number]>();

  for (const step of steps) {
    const key = `${step.part}|${step.partEn}`;
    if (!map.has(key)) {
      const group = { key, part: step.part, partEn: step.partEn, steps: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key)!.steps.push(step);
  }
  return groups;
}

export function MassOrderStepsManager({ initialSteps }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState<MassOrderStepRow[]>(() =>
    [...initialSteps].sort((a, b) => a.stepIndex - b.stepIndex),
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const groups = useMemo(() => groupByPart(steps), [steps]);

  function updateStep(stepIndex: number, patch: Partial<MassOrderStepRow>) {
    setSteps((prev) =>
      prev.map((s) => (s.stepIndex === stepIndex ? { ...s, ...patch } : s)),
    );
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/mass-order-steps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      setMessage("Mass Order text saved. Changes appear in Play → Church.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Edit the subtitles shown when kids click steps under{" "}
        <strong className="text-[var(--color-ink)]">Mass Order</strong> in the 3D church (
        <a
          href="/play/church"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Play → Church
        </a>
        ). Update the <strong>on-screen text</strong> for each step, button labels (title), and
        optional part headings.
      </p>

      <div className="space-y-8">
        {groups.map((group) => (
          <section
            key={group.key}
            className="border border-[var(--color-border)] bg-white p-4"
          >
            <h2 className="text-lg font-bold text-[var(--color-ink)]">{group.partEn}</h2>
            <p className="text-xs text-[var(--color-muted)]">{group.part}</p>

            <div className="mt-4 space-y-4">
              {group.steps.map((step) => (
                <article
                  key={step.stepIndex}
                  className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                      Step {step.stepIndex + 1}
                    </p>
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={step.published}
                        onChange={(e) =>
                          updateStep(step.stepIndex, { published: e.target.checked })
                        }
                      />
                      Live in game
                    </label>
                  </div>

                  <label className="mt-2 block text-xs font-semibold">
                    Button label (title)
                    <input
                      value={step.title}
                      onChange={(e) => updateStep(step.stepIndex, { title: e.target.value })}
                      className="mt-1 w-full border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
                      maxLength={120}
                    />
                  </label>

                  <label className="mt-2 block text-xs font-semibold">
                    On-screen text (subtitle when clicked)
                    <textarea
                      value={step.text}
                      onChange={(e) => updateStep(step.stepIndex, { text: e.target.value })}
                      rows={3}
                      className="mt-1 w-full border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
                      maxLength={2000}
                    />
                  </label>

                  <div className="mt-2 flex flex-wrap gap-3">
                    <label className="text-xs font-semibold">
                      Priest gesture
                      <select
                        value={step.gesture}
                        onChange={(e) =>
                          updateStep(step.stepIndex, { gesture: e.target.value })
                        }
                        className="ml-1 border border-[var(--color-border)] bg-white px-2 py-1 text-sm"
                      >
                        {MASS_ORDER_GESTURES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveAll()}
          className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save all steps"}
        </button>
      </div>
    </div>
  );
}

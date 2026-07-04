"use client";

import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { LENT_WK1_SHOWCASE_SLUG } from "@/lib/lesson-kit/constants";
import type { SundayPinDto } from "@/lib/lesson-kit/sunday-pin";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { formatWeekLabel } from "@/lib/lesson-kit/week";
import Link from "next/link";
import { useEffect, useState } from "react";

type PinOption = { id: string; title: string; scope: string };

type Props = {
  signedIn: boolean;
  initialPin: SundayPinDto | null;
  personal: LessonKitDto[];
  templates: LessonKitDto[];
};

function pinOptionsFromKits(personal: LessonKitDto[], templates: LessonKitDto[]): PinOption[] {
  const personalOpts = personal.map((k) => ({
    id: k.id,
    title: k.title,
    scope: k.scope,
  }));
  const templateOpts = templates.map((k) => ({
    id: k.id,
    title: `${k.title} (template)`,
    scope: k.scope,
  }));
  return [...personalOpts, ...templateOpts];
}

export function MySundayCard({ signedIn, initialPin, personal, templates }: Props) {
  const [pin, setPin] = useState<SundayPinDto | null>(initialPin);
  const [kitId, setKitId] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPin(initialPin);
  }, [initialPin]);

  const options = pinOptionsFromKits(personal, templates);
  const showcase =
    templates.find((t) => t.shareSlug === LENT_WK1_SHOWCASE_SLUG) ?? templates[0] ?? null;

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitId) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/program/sunday-pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonKitId: kitId }),
      });
      if (!res.ok) throw new Error("Could not pin");
      const json = (await res.json()) as SundayPinDto;
      setPin(json);
      setKitId("");
    } catch {
      setError("Could not pin lesson for this week");
    } finally {
      setPending(false);
    }
  };

  const copyHomeLink = async (shareSlug: string) => {
    const url = `${window.location.origin}/lesson/${shareSlug}/family`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!signedIn) {
    if (!showcase) return null;
    return (
      <section className="my-sunday-panel">
        <h2 className="my-sunday-panel__title">My Sunday</h2>
        <p className="my-sunday-panel__lead">
          Try <strong>{showcase.title}</strong> in class this week — no account needed.
        </p>
        <p className="my-sunday-panel__meta">
          {showcase.stepCount} steps · ~{showcase.estMinutes} min
          {showcase.gradeBand ? ` · ${showcase.gradeBand}` : ""}
        </p>
        <div className="my-sunday-panel__actions">
          <Link
            href={`/lesson/${showcase.shareSlug}`}
            className="lesson-big-button text-center no-underline"
          >
            Run in class
          </Link>
          <Link
            href="/account/login?next=/program"
            className="lesson-big-button lesson-big-button--secondary text-center no-underline"
          >
            Sign in to pin your kit
          </Link>
        </div>
      </section>
    );
  }

  const kit = pin?.kit;
  const weekLabel = pin?.weekStart ? formatWeekLabel(pin.weekStart) : "this week";

  return (
    <section className="my-sunday-panel">
      <div className="my-sunday-panel__head">
        <h2 className="my-sunday-panel__title">My Sunday</h2>
        <p className="my-sunday-panel__week">{weekLabel}</p>
      </div>

      {pin?.stale ? (
        <p className="my-sunday-panel__stale" role="status">
          New week — confirm or pick a lesson for Sunday.
        </p>
      ) : null}

      {kit ? (
        <div className="my-sunday-panel__pinned">
          <h3 className="my-sunday-panel__kit-title">{kit.title}</h3>
          {kit.description ? (
            <p className="my-sunday-panel__lead">{kit.description}</p>
          ) : null}
          <p className="my-sunday-panel__meta">
            {kit.stepCount} steps · ~{kit.estMinutes} min
            {kit.gradeBand ? ` · ${kit.gradeBand}` : ""}
            {kit.scope === "GLOBAL_TEMPLATE" ? " · template" : ""}
          </p>
          <div className="my-sunday-panel__actions">
            <Link
              href={`/lesson/${kit.shareSlug}`}
              className="lesson-big-button text-center no-underline"
            >
              Run classroom
            </Link>
            <button
              type="button"
              className="lesson-big-button lesson-big-button--secondary"
              onClick={() => void copyHomeLink(kit.shareSlug)}
            >
              {copied ? "Copied!" : "Copy at-home link"}
            </button>
            {kit.editHref ? (
              <Link
                href={kit.editHref}
                className="lesson-big-button lesson-big-button--secondary text-center no-underline"
              >
                Edit
              </Link>
            ) : null}
          </div>
          {kit.scope === "GLOBAL_TEMPLATE" ? (
            <p className="my-sunday-panel__hint">
              Template — tap <strong>Use this</strong> below to copy and customize.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="my-sunday-panel__lead">
          Pin the lesson you&apos;ll run this Sunday. One tap to open class mode Saturday night.
        </p>
      )}

      <form onSubmit={(e) => void savePin(e)} className="my-sunday-panel__form">
        <label className="block">
          <span className="my-sunday-panel__label">
            {kit ? "Change pinned lesson" : "Pin a lesson"}
          </span>
          <select
            value={kitId}
            onChange={(e) => setKitId(e.target.value)}
            className="my-sunday-panel__select"
          >
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!kitId || pending}
          className="lesson-big-button lesson-big-button--secondary mt-3 w-full sm:w-auto"
        >
          {pending ? "Saving…" : kit ? "Update pin" : "Pin for this Sunday"}
        </button>
        {error ? <p className="my-sunday-panel__error">{error}</p> : null}
      </form>

      {kit && pin?.stale ? (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-[var(--color-link)]"
          onClick={() => {
            if (!kit) return;
            setKitId(kit.id);
            void fetch("/api/program/sunday-pin", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lessonKitId: kit.id }),
            })
              .then((r) => r.json())
              .then((json: SundayPinDto) => setPin(json));
          }}
        >
          Keep {kit.title} for this week →
        </button>
      ) : null}

      {kit ? (
        <button
          type="button"
          className="mt-4 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          onClick={() => {
            void fetch("/api/program/sunday-pin", { method: "DELETE" })
              .then((r) => r.json())
              .then((json: SundayPinDto) => setPin(json));
          }}
        >
          Clear pin
        </button>
      ) : null}

      <p className="my-sunday-panel__hint">
        <LessonIcon name="home" size="sm" className="mr-1 inline-block align-text-bottom" />
        At-home link is separate from student assignments on your dashboard.
      </p>
    </section>
  );
}

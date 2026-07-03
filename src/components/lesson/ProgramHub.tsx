"use client";

import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "@/styles/lesson-kit.css";

type LoadState = {
  templates: LessonKitDto[];
  personal: LessonKitDto[];
  parish: LessonKitDto[];
  signedIn: boolean;
  parishInfo: { name: string; role: string } | null;
};

export function ProgramHub() {
  const router = useRouter();
  const [data, setData] = useState<LoadState | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const load = useCallback(() => {
    void fetch("/api/program/kits")
      .then((r) => r.json())
      .then((json: LoadState) => setData(json));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const duplicateTemplate = async (sourceId: string) => {
    if (!data?.signedIn) {
      router.push("/account/login?next=/program");
      return;
    }
    setDuplicating(sourceId);
    try {
      const res = await fetch("/api/program/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      const json = (await res.json()) as { kit?: LessonKitDto };
      if (json.kit) {
        router.push(`/program/kit/${json.kit.id}`);
      }
    } finally {
      setDuplicating(null);
      load();
    }
  };

  if (!data) {
    return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-10">
      {data.signedIn ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">My lessons</h2>
            <Link href="/program/templates" className="text-sm font-semibold text-[var(--color-link)]">
              Templates
            </Link>
          </div>
          {data.personal.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              Pick a template below and tap <strong>Use this</strong>.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.personal.map((kit) => (
                <LessonKitCard
                  key={kit.id}
                  title={kit.title}
                  description={kit.description}
                  stepCount={kit.stepCount}
                  estMinutes={kit.estMinutes}
                  runHref={`/lesson/${kit.shareSlug}`}
                  secondaryHref={`/program/kit/${kit.id}`}
                  secondaryLabel="Edit"
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="rounded border border-[#e8e0d6] bg-[#fffaf5] px-4 py-3 text-sm text-[var(--color-muted)]">
          <Link href="/account/login?next=/program" className="font-semibold text-[var(--color-link)]">
            Sign in
          </Link>{" "}
          to save your own copies. Templates run without an account.
        </p>
      )}

      {data.parishInfo && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">{data.parishInfo.name}</h2>
            {data.parishInfo.role === "DRE" && (
              <Link href="/program/parish" className="text-sm font-semibold text-[var(--color-link)]">
                Dashboard
              </Link>
            )}
          </div>
          {data.parish.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.parish.map((kit) => (
                <LessonKitCard
                  key={kit.id}
                  title={kit.title}
                  description={kit.description}
                  stepCount={kit.stepCount}
                  estMinutes={kit.estMinutes}
                  runHref={`/lesson/${kit.shareSlug}`}
                  secondaryHref={data.signedIn ? undefined : undefined}
                  secondaryLabel={data.signedIn ? "Use this" : undefined}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-[var(--color-ink)]">Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.templates.map((kit) => (
            <article key={kit.id} className="lesson-kit-card">
              <h3 className="text-lg font-bold text-[var(--color-ink)]">{kit.title}</h3>
              {kit.description ? (
                <p className="text-sm text-[var(--color-muted)]">{kit.description}</p>
              ) : null}
              <p className="lesson-kit-card__meta">
                {kit.stepCount} steps · ~{kit.estMinutes} min
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  href={`/lesson/${kit.shareSlug}`}
                  className="lesson-big-button flex-1 text-center no-underline"
                >
                  Run
                </Link>
                <button
                  type="button"
                  disabled={duplicating === kit.id}
                  onClick={() => void duplicateTemplate(kit.id)}
                  className="lesson-big-button lesson-big-button--secondary flex-1"
                >
                  {duplicating === kit.id ? "…" : "Use this"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        New parish?{" "}
        <Link href="/program/join" className="font-semibold text-[var(--color-link)]">
          Join with code
        </Link>
      </p>
    </div>
  );
}

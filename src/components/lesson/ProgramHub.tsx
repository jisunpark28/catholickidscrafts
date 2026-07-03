"use client";

import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import { TptPartnerNote } from "@/components/lesson/TptPartnerNote";
import type { ProgramHubData } from "@/lib/lesson-kit/program-hub";
import { LESSON_KIT_PRODUCT_NAME } from "@/lib/lesson-kit/branding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import "@/styles/lesson-kit.css";

type Props = {
  initialData: ProgramHubData;
};

export function ProgramHub({ initialData }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void fetch("/api/program/kits")
      .then((r) => r.json())
      .then((json: ProgramHubData) => setData(json));
  }, []);

  const duplicateTemplate = async (sourceId: string) => {
    if (!data.signedIn) {
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
      const json = (await res.json()) as { kit?: { id: string } };
      if (json.kit) {
        router.push(`/program/kit/${json.kit.id}`);
        return;
      }
    } finally {
      setDuplicating(null);
      refresh();
    }
  };

  return (
    <div className="space-y-10">
      <TptPartnerNote variant="hub" />

      {data.signedIn ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">My {LESSON_KIT_PRODUCT_NAME}s</h2>
            <Link href="/program/templates" className="text-sm font-semibold text-[var(--color-link)]">
              Browse templates
            </Link>
          </div>
          {data.personal.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              Pick a template below and tap <strong>Use this</strong> to make your own copy.
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
                  tptUrl={kit.tptUrl}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="rounded border border-[#e8e0d6] bg-[#fffaf5] px-4 py-3 text-sm text-[var(--color-muted)]">
          <Link href="/account/login?next=/program" className="font-semibold text-[var(--color-link)]">
            Sign in free
          </Link>{" "}
          to save and edit your own {LESSON_KIT_PRODUCT_NAME.toLowerCase()}s. Templates run without an account.
        </p>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-[var(--color-ink)]">Starter templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.templates.map((kit) => (
            <article key={kit.id} className="lesson-kit-card">
              <h3 className="text-lg font-bold text-[var(--color-ink)]">{kit.title}</h3>
              {kit.description ? (
                <p className="text-sm text-[var(--color-muted)]">{kit.description}</p>
              ) : null}
              <p className="lesson-kit-card__meta">
                {kit.stepCount} steps · ~{kit.estMinutes} min
                {kit.gradeBand ? ` · ${kit.gradeBand}` : ""}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  href={`/lesson/${kit.shareSlug}`}
                  className="lesson-big-button flex-1 text-center no-underline"
                >
                  Run in class
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
        Need crafts and worksheets? Many kits link to free samples on{" "}
        <a
          href={process.env.NEXT_PUBLIC_TPT_STORE_URL ?? "https://www.teacherspayteachers.com/store/catholic-kids-crafts"}
          className="font-semibold text-[var(--color-link)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Teachers Pay Teachers
        </a>
        .
      </p>
    </div>
  );
}

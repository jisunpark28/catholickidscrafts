"use client";

import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import type { CommunityLessonKitSummary } from "@/lib/lesson-kit/community";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialKits: CommunityLessonKitSummary[];
  signedIn: boolean;
};

export function CommunityLessonGrid({ initialKits, signedIn }: Props) {
  const router = useRouter();
  const [kits] = useState(initialKits);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const duplicateKit = async (sourceId: string) => {
    if (!signedIn) {
      router.push("/account/login?next=/program/community");
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
      }
    } finally {
      setDuplicating(null);
    }
  };

  if (kits.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No teacher-shared lessons yet.{" "}
        {signedIn ? (
          <>
            Open one of your kits and turn on <strong>Share with other teachers</strong>.
          </>
        ) : (
          <>
            <Link href="/account/login?next=/program/community" className="font-semibold text-[var(--color-link)]">
              Sign in
            </Link>{" "}
            to share your own lesson plans.
          </>
        )}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kits.map((kit) => (
        <LessonKitCard
          key={kit.id}
          title={kit.title}
          description={kit.description}
          stepCount={kit.stepCount}
          estMinutes={kit.estMinutes}
          gradeBand={kit.gradeBand}
          authorDisplayName={kit.authorDisplayName}
          runHref={`/lesson/${kit.shareSlug}`}
          secondaryLabel="Use this"
          onSecondaryClick={() => void duplicateKit(kit.id)}
          secondaryDisabled={duplicating === kit.id}
        />
      ))}
    </div>
  );
}

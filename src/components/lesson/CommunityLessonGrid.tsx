"use client";

import { LessonKitCard } from "@/components/lesson/LessonKitCard";
import type { CommunityLessonKitSummary } from "@/lib/lesson-kit/community";
import Link from "next/link";

type Props = {
  initialKits: CommunityLessonKitSummary[];
  signedIn: boolean;
};

export function CommunityLessonGrid({ initialKits, signedIn }: Props) {
  const kits = initialKits;

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
          detailHref={`/program/community/${kit.shareSlug}`}
          secondaryHref={`/program/community/${kit.shareSlug}`}
          secondaryLabel="View plan"
        />
      ))}
    </div>
  );
}

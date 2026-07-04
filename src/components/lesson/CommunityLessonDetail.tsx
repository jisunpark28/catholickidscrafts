import { LessonBlockIcon } from "@/components/icons/lesson/LessonIcon";
import { CommunityForkButton } from "@/components/lesson/CommunityForkButton";
import { CommunityLessonComments } from "@/components/lesson/CommunityLessonComments";
import { lessonBlockSummaryLine } from "@/lib/lesson-kit/block-summary";
import { LESSON_BLOCK_DEFAULT_LABEL } from "@/lib/lesson-kit/constants";
import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import Link from "next/link";

type Props = {
  kit: LessonKitDto;
  signedIn: boolean;
};

export function CommunityLessonDetail({ kit, signedIn }: Props) {
  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-[var(--color-border)] pb-6">
        {kit.authorDisplayName ? (
          <p className="text-sm font-semibold text-[var(--color-muted)]">
            Shared by {kit.authorDisplayName}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold text-[var(--color-ink)]">{kit.title}</h1>
        {kit.description ? (
          <p className="text-base leading-relaxed text-[var(--color-ink)]">{kit.description}</p>
        ) : null}
        <p className="text-sm text-[var(--color-muted)]">
          {kit.stepCount} steps · ~{kit.estMinutes} min
          {kit.gradeBand ? ` · ${kit.gradeBand}` : ""}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={`/lesson/${kit.shareSlug}`} className="lesson-big-button flex-1 text-center no-underline">
            Run in class
          </Link>
          <CommunityForkButton
            kitId={kit.id}
            shareSlug={kit.shareSlug}
            signedIn={signedIn}
            className="lesson-big-button lesson-big-button--secondary flex-1"
          />
        </div>
        {!signedIn ? (
          <p className="text-xs text-[var(--color-muted)]">
            Sign in free to copy this plan into your account and edit the steps.
          </p>
        ) : null}
      </header>

      <section>
        <h2 className="mb-4 text-xl font-bold text-[var(--color-ink)]">Lesson steps</h2>
        <ol className="space-y-3">
          {kit.blocks.map((block, index) => (
            <li
              key={block.id}
              className="flex gap-3 rounded border border-[var(--color-border)] bg-white p-4"
            >
              <span className="mt-0.5 shrink-0">
                <LessonBlockIcon type={block.type} size="lg" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {index + 1}. {blockDisplayLabel(block)}
                  <span className="ml-2 font-normal text-[var(--color-muted)]">
                    ({LESSON_BLOCK_DEFAULT_LABEL[block.type]})
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                  {lessonBlockSummaryLine(block)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <CommunityLessonComments kitId={kit.id} shareSlug={kit.shareSlug} signedIn={signedIn} />
    </div>
  );
}

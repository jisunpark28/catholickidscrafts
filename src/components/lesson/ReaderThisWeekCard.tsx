import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { getThisWeekAssignmentForReader } from "@/lib/lesson-kit/assignments";
import { formatWeekLabel, weekStartSundayUtc } from "@/lib/lesson-kit/week";
import { getReaderKey } from "@/lib/bible/reader";
import Link from "next/link";

export async function ReaderThisWeekCard() {
  const reader = await getReaderKey();
  const assignment = await getThisWeekAssignmentForReader(reader);
  if (!assignment) return null;

  const weekStart = weekStartSundayUtc();

  return (
    <section
      className="mb-8 rounded-xl border-2 border-[var(--color-accent)] bg-[#fffaf5] px-4 py-4 sm:px-5"
      aria-label="This week's class lesson"
    >
      <div className="flex items-start gap-3">
        <LessonIcon name="home" active size="lg" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Teacher assigned · {formatWeekLabel(weekStart)}
          </p>
          <h2 className="mt-1 text-lg font-bold text-[var(--color-ink)]">{assignment.kit.title}</h2>
          {assignment.note ? (
            <p className="mt-1 text-sm text-[var(--color-muted)]">{assignment.note}</p>
          ) : null}
          <Link
            href={`/lesson/${assignment.kit.shareSlug}/family`}
            className="lesson-big-button mt-4 inline-flex !min-h-0 !w-auto !px-5 !py-2.5 !text-sm no-underline"
          >
            Start lesson
          </Link>
        </div>
      </div>
    </section>
  );
}

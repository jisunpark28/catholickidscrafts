import type { LessonKitForkAttribution } from "@/lib/lesson-kit/community";
import Link from "next/link";

type Props = {
  attribution: LessonKitForkAttribution;
};

export function LessonForkAttributionBanner({ attribution }: Props) {
  const { authorLabel, title, href } = attribution;

  return (
    <p className="rounded border border-[#e8e0d6] bg-[#fffaf5] px-4 py-3 text-sm text-[var(--color-ink)]">
      Copied from{" "}
      {href ? (
        <Link href={href} className="font-semibold text-[var(--color-link)]">
          {authorLabel}&apos;s lesson
        </Link>
      ) : (
        <span className="font-semibold">{authorLabel}&apos;s lesson</span>
      )}{" "}
      <span className="font-semibold">«{title}»</span>
    </p>
  );
}

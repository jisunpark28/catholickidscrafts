import { lessonKitDocxExportUrl } from "@/lib/lesson-kit/export-access";

type Props = {
  kitId: string;
  className?: string;
  label?: string;
};

export function LessonKitDocxDownloadLink({
  kitId,
  className = "text-sm font-semibold text-[var(--color-link)]",
  label = "Download Word",
}: Props) {
  return (
    <a href={lessonKitDocxExportUrl(kitId)} className={className} download>
      {label}
    </a>
  );
}

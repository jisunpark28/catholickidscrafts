import { lessonKitPdfExportUrl } from "@/lib/lesson-kit/export-access";

type Props = {
  kitId: string;
  className?: string;
  label?: string;
};

export function LessonKitPdfDownloadLink({
  kitId,
  className = "text-sm font-semibold text-[var(--color-link)]",
  label = "Download PDF",
}: Props) {
  return (
    <a href={lessonKitPdfExportUrl(kitId)} className={className} download>
      {label}
    </a>
  );
}

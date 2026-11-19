import { activityPath, SAINT_REPORT_SLUG } from "@/lib/resource/activities";
import Link from "next/link";

/** "For teachers & parents" box linking the free Saint Report Worksheet (saints hub + saint pages). */
export function SaintReportWorksheetLink({ className = "" }: { className?: string }) {
  return (
    <section
      aria-labelledby="teachers-parents"
      className={`rounded-2xl border border-[#f0d9b8] bg-white/90 p-4${className ? ` ${className}` : ""}`}
    >
      <h2 id="teachers-parents" className="m-0 font-[Georgia,serif] text-lg font-bold text-[#1f2937]">
        For teachers &amp; parents
      </h2>
      <p className="mb-0 mt-2 text-base leading-relaxed text-[#374151]">
        Print the{" "}
        <Link href={activityPath(SAINT_REPORT_SLUG)} className="font-semibold text-[#335599] hover:underline">
          Saint Report Worksheet
        </Link>{" "}
        for a saint research project: feast day, patron, symbols, how the saint loved God, one way to follow their
        example, and a space to draw. Free with a family account.
      </p>
    </section>
  );
}

import { WeeklyIssueEditor } from "@/components/admin/WeeklyIssueEditor";
import Link from "next/link";

export default function NewWeeklyIssuePage() {
  return (
    <div>
      <Link href="/admin/weekly" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Weekly content
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New weekly issue</h1>
      <div className="mt-6">
        <WeeklyIssueEditor />
      </div>
    </div>
  );
}
import { GospelSheetEditor } from "@/components/admin/GospelSheetEditor";
import Link from "next/link";

export default function NewGospelSheetPage() {
  return (
    <div>
      <Link href="/admin/weekly" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Weekly content
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New Sunday Gospel sheet</h1>
      <div className="mt-6">
        <GospelSheetEditor />
      </div>
    </div>
  );
}

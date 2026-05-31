import { CurriculumEditor } from "@/components/admin/CurriculumEditor";
import Link from "next/link";

export default function NewCurriculumPage() {
  return (
    <div>
      <Link href="/admin/curriculum" className="text-sm font-semibold text-[var(--color-link)]">
        ← Curriculum
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New curriculum track</h1>
      <div className="mt-6">
        <CurriculumEditor />
      </div>
    </div>
  );
}

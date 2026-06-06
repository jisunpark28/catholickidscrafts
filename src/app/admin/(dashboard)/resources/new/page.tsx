import { ResourceEditor } from "@/components/admin/ResourceEditor";
import { getCurriculumTitleLabels } from "@/lib/curriculum-stages";
import Link from "next/link";

export default async function NewResourcePage() {
  const titleOptions = await getCurriculumTitleLabels();

  return (
    <div>
      <Link href="/admin/resources" className="text-sm font-semibold text-[var(--color-link)]">
        ← Resources
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New resource</h1>
      <div className="mt-6">
        <ResourceEditor titleOptions={titleOptions} />
      </div>
    </div>
  );
}

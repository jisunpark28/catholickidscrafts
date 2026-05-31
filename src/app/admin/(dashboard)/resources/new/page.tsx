import { ResourceEditor } from "@/components/admin/ResourceEditor";
import Link from "next/link";

export default function NewResourcePage() {
  return (
    <div>
      <Link href="/admin/resources" className="text-sm font-semibold text-[var(--color-link)]">
        ← Resources
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New resource</h1>
      <div className="mt-6">
        <ResourceEditor />
      </div>
    </div>
  );
}

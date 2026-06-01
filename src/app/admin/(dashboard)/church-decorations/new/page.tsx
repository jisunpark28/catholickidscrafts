import { ChurchDecorationEditor } from "@/components/admin/ChurchDecorationEditor";
import Link from "next/link";

export default function NewChurchDecorationPage() {
  return (
    <div>
      <Link
        href="/admin/church-decorations"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Church decorations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New church decoration</h1>
      <div className="mt-6">
        <ChurchDecorationEditor />
      </div>
    </div>
  );
}

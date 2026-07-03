import { listGlobalTemplates } from "@/lib/lesson-kit/db";
import Link from "next/link";

export default async function AdminLessonTemplatesPage() {
  const templates = await listGlobalTemplates();

  return (
    <div>
      <h1 className="text-2xl font-bold">Lesson templates</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Global kits for <Link href="/program">/program</Link>. Edit in DB seed or add API later.
      </p>
      <ul className="mt-6 space-y-3">
        {templates.map((kit) => (
          <li
            key={kit.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-border)] bg-white px-4 py-3"
          >
            <div>
              <p className="font-bold text-[var(--color-ink)]">{kit.title}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {kit.stepCount} steps · {kit.shareSlug}
              </p>
            </div>
            <Link
              href={`/lesson/${kit.shareSlug}`}
              className="text-sm font-semibold text-[var(--color-link)]"
              target="_blank"
            >
              Run →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

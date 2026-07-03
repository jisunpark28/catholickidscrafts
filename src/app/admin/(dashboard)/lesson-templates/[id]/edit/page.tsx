import { LessonKitEditor } from "@/components/lesson/LessonKitEditor";
import { getAdminGlobalTemplate } from "@/lib/lesson-kit/admin-templates";
import { notFound } from "next/navigation";
import Link from "next/link";
import "@/styles/lesson-kit.css";

type Props = { params: Promise<{ id: string }> };

export default async function AdminLessonTemplateEditPage({ params }: Props) {
  const { id } = await params;
  const kit = await getAdminGlobalTemplate(id);
  if (!kit) notFound();

  return (
    <div>
      <Link href="/admin/lesson-templates" className="text-sm font-semibold text-[var(--color-link)]">
        ← Lesson templates
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit template</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {kit.published ? "Visible on /program" : "Draft — check Published to show on /program"}
      </p>
      <div className="mt-6">
        <LessonKitEditor
          initialKit={kit}
          apiBase="/api/admin/lesson-templates"
          backHref="/admin/lesson-templates"
          backLabel="Templates"
          printHref={null}
          adminMeta
        />
      </div>
    </div>
  );
}

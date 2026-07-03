import { AdminLessonTemplatesList } from "@/components/admin/AdminLessonTemplatesList";
import { adminTemplatesNavItems, LessonKitNav } from "@/components/lesson/LessonKitNav";
import { listAdminGlobalTemplates } from "@/lib/lesson-kit/admin-templates";
import Link from "next/link";

export default async function AdminLessonTemplatesPage() {
  const templates = await listAdminGlobalTemplates();

  return (
    <div>
      <LessonKitNav items={adminTemplatesNavItems()} className="mb-4" />
      <h1 className="text-2xl font-bold">Lesson templates</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Global Lesson Kits on{" "}
        <Link href="/program" className="font-semibold text-[var(--color-link)]">
          /program
        </Link>
        . Create, edit, and publish without running seed scripts.
      </p>
      <AdminLessonTemplatesList initialTemplates={templates} />
    </div>
  );
}

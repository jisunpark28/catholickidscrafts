import { CurriculumEditor } from "@/components/admin/CurriculumEditor";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditCurriculumPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.curriculumTrack.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/curriculum" className="text-sm font-semibold text-[var(--color-link)]">
        ← Curriculum
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit curriculum track</h1>
      <div className="mt-6">
        <CurriculumEditor
          initial={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            stage: item.stage,
            description: item.description,
            body: item.body,
            lessonCount: item.lessonCount,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}

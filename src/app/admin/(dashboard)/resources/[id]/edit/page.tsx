import { ResourceEditor } from "@/components/admin/ResourceEditor";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditResourcePage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.resource.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/resources" className="text-sm font-semibold text-[var(--color-link)]">
        ← Resources
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit resource</h1>
      <div className="mt-6">
        <ResourceEditor
          initial={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            content: item.content,
            contentFormat: item.contentFormat,
            grade: item.grade,
            topic: item.topic,
            liturgicalPeriod: item.liturgicalPeriod,
            downloadLabel: item.downloadLabel ?? "",
            downloadUrl: item.downloadUrl ?? "",
            tptUrl: item.tptUrl ?? "",
            isFreeSample: item.isFreeSample,
            previewImageUrl: item.previewImageUrl ?? "",
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}

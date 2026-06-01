import { RecommendationEditor } from "@/components/admin/RecommendationEditor";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditRecommendationPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.recommendation.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/recommendations" className="text-sm font-semibold text-[var(--color-link)]">
        ← Recommendations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit recommendation</h1>
      <div className="mt-6">
        <RecommendationEditor
          initial={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            description: item.description,
            kind: item.kind,
            externalUrl: item.externalUrl,
            author: item.author ?? "",
            imageUrl: item.imageUrl ?? "",
            tags: item.tags,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}

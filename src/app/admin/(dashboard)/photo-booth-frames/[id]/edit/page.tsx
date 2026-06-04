import { PhotoBoothFrameEditor } from "@/components/admin/PhotoBoothFrameEditor";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditPhotoBoothFramePage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.photoBoothFrame.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link
        href="/admin/photo-booth-frames"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Photo booth frames
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit frame</h1>
      <div className="mt-6">
        <PhotoBoothFrameEditor
          initial={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            imageUrl: item.imageUrl,
            layout: item.layout,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}

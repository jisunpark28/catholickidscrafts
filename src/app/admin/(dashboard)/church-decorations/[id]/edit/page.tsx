import { ChurchDecorationEditor } from "@/components/admin/ChurchDecorationEditor";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditChurchDecorationPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.churchDecoration.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link
        href="/admin/church-decorations"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Church decorations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit decoration</h1>
      <div className="mt-6">
        <ChurchDecorationEditor
          initial={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            description: item.description,
            imageUrl: item.imageUrl,
            posX: item.posX,
            posY: item.posY,
            posZ: item.posZ,
            width: item.width,
            height: item.height,
            rotationY: item.rotationY,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}

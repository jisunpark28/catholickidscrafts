import { LiturgyCardEditor } from "@/components/admin/LiturgyCardEditor";
import { isLiturgyTopic } from "@/lib/liturgy-topics";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditLiturgyCardPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.liturgyCard.findUnique({ where: { id } });
  if (!item || !isLiturgyTopic(item.topic)) notFound();

  return (
    <div>
      <Link
        href={`/admin/liturgy-cards?topic=${item.topic}`}
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Liturgy cards
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit card</h1>
      <div className="mt-6 max-w-xl">
        <LiturgyCardEditor
          initial={{
            id: item.id,
            topic: item.topic,
            title: item.title,
            href: item.href,
            imageUrl: item.imageUrl,
            sortOrder: item.sortOrder,
          }}
        />
      </div>
    </div>
  );
}

import { LiturgyQaCardEditor } from "@/components/admin/LiturgyQaCardEditor";
import { requireAdminPage } from "@/lib/admin-auth";
import { ID_RE } from "@/lib/liturgy-qa-admin";
import { isQaTopic, QA_TOPIC_LABELS } from "@/lib/liturgy-qa-topics";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditLiturgyQaCardPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  if (!ID_RE.test(id)) notFound();
  const card = await prisma.liturgyQaCard.findUnique({ where: { id } });
  if (!card || !isQaTopic(card.topicSlug)) notFound();

  return (
    <div>
      <Link href={`/admin/liturgy-qa?topic=${card.topicSlug}`} className="text-sm font-semibold text-[var(--color-link)]">
        ← {QA_TOPIC_LABELS[card.topicSlug]} Q&amp;A cards
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit card #{card.sortOrder}</h1>
      <div className="mt-6 max-w-3xl">
        <LiturgyQaCardEditor
          id={card.id}
          topicSlug={card.topicSlug}
          initial={{
            question: card.question,
            answer: card.answer,
            tryThis: card.tryThis,
            iconFallback: card.iconFallback,
            imageFilename: card.imageFilename,
            imageUrl: card.imageUrl ?? "",
            imageScene: card.imageScene,
            imagePrompt: card.imagePrompt,
            altText: card.altText,
            cardColor: card.cardColor,
            status: card.status,
            internalSourceRef: card.internalSourceRef,
            reviewNote: card.reviewNote,
          }}
        />
      </div>
    </div>
  );
}

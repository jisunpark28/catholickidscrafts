import { LiturgyQaCardEditor } from "@/components/admin/LiturgyQaCardEditor";
import { qaListHref } from "@/lib/admin-liturgy-paths";
import { requireAdminPage } from "@/lib/admin-auth";
import { isQaTopic, QA_TOPIC_LABELS, type QaTopic } from "@/lib/liturgy-qa-topics";
import Link from "next/link";

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function NewLiturgyQaCardPage({ searchParams }: Props) {
  await requireAdminPage();
  const { topic: raw } = await searchParams;
  const topic: QaTopic = raw && isQaTopic(raw) ? raw : "mass";

  return (
    <div>
      <Link href={qaListHref(topic)} className="text-sm font-semibold text-[var(--color-link)]">
        ← {QA_TOPIC_LABELS[topic]} Q&amp;A cards
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New card for {QA_TOPIC_LABELS[topic]}</h1>
      <div className="mt-6 max-w-3xl">
        <LiturgyQaCardEditor topicSlug={topic} />
      </div>
    </div>
  );
}

import { DeleteLiturgyCardButton } from "@/components/admin/DeleteLiturgyCardButton";
import { LiturgyCardEditor } from "@/components/admin/LiturgyCardEditor";
import {
  isLiturgyTopic,
  LITURGY_TOPIC_LABELS,
  LITURGY_TOPICS,
  type LiturgyTopic,
} from "@/lib/liturgy-topics";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function AdminLiturgyCardsPage({ searchParams }: Props) {
  const params = await searchParams;
  const topic: LiturgyTopic = params.topic && isLiturgyTopic(params.topic) ? params.topic : "mass";
  const items = await prisma.liturgyCard.findMany({
    where: { topic },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Liturgy cards</h1>
      <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
        Cards shown on the public liturgy grids. Each card needs the link the square opens, and can
        include an image and a short title.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Liturgy topics">
        {LITURGY_TOPICS.map((value) => {
          const current = value === topic;
          return (
            <Link
              key={value}
              href={`/admin/liturgy-cards?topic=${value}`}
              aria-current={current ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                current
                  ? "bg-[#f5ebe0] text-[var(--color-ink)]"
                  : "bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {LITURGY_TOPIC_LABELS[value]}
            </Link>
          );
        })}
      </nav>

      <h2 className="mt-8 text-lg font-bold">{LITURGY_TOPIC_LABELS[topic]}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          No cards yet. The public page shows empty frames until you add one.
        </p>
      ) : (
        <table className="mt-4 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
          <thead className="bg-[var(--color-surface)] text-left">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Link</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border-t border-[var(--color-border)] p-3">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-dashed border-[#d9d3cb] object-cover"
                    />
                  ) : (
                    <span className="text-[var(--color-muted)]">None</span>
                  )}
                </td>
                <td className="border-t border-[var(--color-border)] p-3 font-semibold">
                  {item.title || "Untitled"}
                </td>
                <td className="max-w-xs truncate border-t border-[var(--color-border)] p-3">
                  {item.href}
                </td>
                <td className="border-t border-[var(--color-border)] p-3 text-right">
                  <Link
                    href={`/admin/liturgy-cards/${item.id}/edit`}
                    className="mr-4 font-semibold text-[var(--color-link)]"
                  >
                    Edit
                  </Link>
                  <DeleteLiturgyCardButton id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-10 text-lg font-bold">Add a card</h2>
      <div className="mt-4 max-w-xl">
        <LiturgyCardEditor key={topic} topic={topic} />
      </div>
    </div>
  );
}

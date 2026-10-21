import { LiturgyQaBulkStatus, LiturgyQaRowActions } from "@/components/admin/LiturgyQaRowActions";
import { LiturgyQaTopicEditor } from "@/components/admin/LiturgyQaTopicEditor";
import { requireAdminPage } from "@/lib/admin-auth";
import { isQaTopic, QA_TOPIC_LABELS, QA_TOPICS, type QaTopic } from "@/lib/liturgy-qa-topics";
import { prisma } from "@/lib/prisma";
import type { LiturgyQaStatus } from "@prisma/client";
import Link from "next/link";

type Props = { searchParams: Promise<{ topic?: string; status?: string }> };

const STATUS_FILTERS = ["all", "DRAFT", "PUBLISHED"] as const;

export default async function AdminLiturgyQaPage({ searchParams }: Props) {
  await requireAdminPage();
  const params = await searchParams;
  const topic: QaTopic = params.topic && isQaTopic(params.topic) ? params.topic : "mass";
  const status = params.status === "DRAFT" || params.status === "PUBLISHED" ? (params.status as LiturgyQaStatus) : undefined;

  const [topicRow, cards, counts] = await Promise.all([
    prisma.liturgyQaTopic.findUnique({ where: { slug: topic } }),
    prisma.liturgyQaCard.findMany({
      where: { topicSlug: topic, ...(status ? { status } : {}) },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.liturgyQaCard.groupBy({ by: ["status"], where: { topicSlug: topic }, _count: true }),
  ]);
  const published = counts.find((c) => c.status === "PUBLISHED")?._count ?? 0;
  const drafts = counts.find((c) => c.status === "DRAFT")?._count ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Liturgy Q&amp;A cards</h1>
      <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
        Kid question flip cards shown at the top of each liturgy page. Only published cards appear on the
        site. Source refs and review notes stay in admin.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Topics">
        {QA_TOPICS.map((value) => (
          <Link
            key={value}
            href={`/admin/liturgy-qa?topic=${value}${status ? `&status=${status}` : ""}`}
            aria-current={value === topic ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              value === topic ? "bg-[#f5ebe0] text-[var(--color-ink)]" : "bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {QA_TOPIC_LABELS[value]}
          </Link>
        ))}
      </nav>

      {!topicRow ? (
        <p className="mt-8 border border-amber-200 bg-amber-50 p-4 text-sm">
          This topic is not set up yet. Run <code>npm run db:seed-liturgy-qa</code> to load the topics and cards.
        </p>
      ) : (
        <>
          <details className="mt-8 max-w-3xl border border-[var(--color-border)] bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Page header: {topicRow.title} <span className="font-normal text-[var(--color-muted)]">(Big idea, colours)</span>
            </summary>
            <div className="mt-4">
              <LiturgyQaTopicEditor
                slug={topicRow.slug}
                initial={{
                  title: topicRow.title,
                  bigIdea: topicRow.bigIdea,
                  ageNote: topicRow.ageNote,
                  accentColor: topicRow.accentColor,
                  cardBackColor: topicRow.cardBackColor,
                }}
              />
            </div>
          </details>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm">
              <b>{published}</b> published · <b>{drafts}</b> draft
            </span>
            <span className="flex gap-1" aria-label="Status filter">
              {STATUS_FILTERS.map((value) => {
                const current = (value === "all" && !status) || value === status;
                return (
                  <Link
                    key={value}
                    href={`/admin/liturgy-qa?topic=${topic}${value === "all" ? "" : `&status=${value}`}`}
                    aria-current={current ? "page" : undefined}
                    className={`rounded px-2 py-1 text-xs font-semibold ${current ? "bg-[var(--color-ink)] text-white" : "bg-white"}`}
                  >
                    {value === "all" ? "All" : value === "DRAFT" ? "Drafts" : "Published"}
                  </Link>
                );
              })}
            </span>
            <LiturgyQaBulkStatus topic={topic} />
            <Link
              href={`/admin/liturgy-qa/new?topic=${topic}`}
              className="ml-auto bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
            >
              Add card
            </Link>
          </div>

          <table className="mt-4 w-full border-collapse border border-[var(--color-border)] bg-white text-sm">
            <thead className="bg-[var(--color-surface)] text-left">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Card</th>
                <th className="p-3">Question</th>
                <th className="p-3">Status</th>
                <th className="p-3">Review note (admin only)</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {cards.map((card, index) => (
                <tr key={card.id} className="align-top">
                  <td className="border-t border-[var(--color-border)] p-3 text-[var(--color-muted)]">{card.sortOrder}</td>
                  <td className="border-t border-[var(--color-border)] p-3">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    ) : (
                      <span
                        className="flex h-12 w-16 items-center justify-center rounded-lg text-2xl"
                        style={{ background: card.cardColor || "#ffe3cc" }}
                        aria-hidden
                      >
                        {card.iconFallback || "?"}
                      </span>
                    )}
                  </td>
                  <td className="border-t border-[var(--color-border)] p-3">
                    <div className="font-semibold">{card.question}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">{card.answer}</div>
                    {card.internalSourceRef && (
                      <div className="mt-1 text-[11px] text-[var(--color-muted)]">Source: {card.internalSourceRef}</div>
                    )}
                  </td>
                  <td className="border-t border-[var(--color-border)] p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        card.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {card.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="max-w-xs border-t border-[var(--color-border)] p-3 text-xs text-amber-900">
                    {card.reviewNote}
                  </td>
                  <td className="border-t border-[var(--color-border)] p-3 text-right">
                    <LiturgyQaRowActions
                      id={card.id}
                      status={card.status}
                      first={index === 0}
                      last={index === cards.length - 1}
                      canReorder={!status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cards.length === 0 && <p className="mt-3 text-sm text-[var(--color-muted)]">No cards match this filter.</p>}
        </>
      )}
    </div>
  );
}

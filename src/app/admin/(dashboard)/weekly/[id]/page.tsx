import { WeeklyIssueEditor } from "@/components/admin/WeeklyIssueEditor";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/weekly-content";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditWeeklyIssuePage({ params }: Props) {
  const { id } = await params;
  const issue = await prisma.weeklyIssue.findUnique({
    where: { id },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
  if (!issue) notFound();

  return (
    <div>
      <Link href="/admin/weekly" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Weekly content
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit weekly issue</h1>
      <div className="mt-6">
        <WeeklyIssueEditor
          initial={{
            id: issue.id,
            sundayDate: toDateInput(issue.sundayDate),
            title: issue.title,
            season: issue.season,
            cycle: issue.cycle,
            gospelRef: issue.gospelRef,
            color: issue.color,
            published: issue.published,
            items: issue.items.map((item) => ({
              key: item.id,
              title: item.title,
              type: item.type,
              fileUrl: item.fileUrl,
              thumbUrl: item.thumbUrl,
              topic: item.topic ?? "",
            })),
          }}
        />
      </div>
    </div>
  );
}
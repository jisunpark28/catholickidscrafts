import { GospelSheetEditor } from "@/components/admin/GospelSheetEditor";
import { toSheetView } from "@/lib/gospel-sheet";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditGospelSheetPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.gospelSheet.findUnique({ where: { id } });
  if (!row) notFound();
  const s = toSheetView(row);

  return (
    <div>
      <Link href="/admin/weekly" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Weekly content
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit Sunday Gospel sheet</h1>
      {row.emailSentAt ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">Friday email already sent for this sheet.</p>
      ) : null}
      <div className="mt-6">
        <GospelSheetEditor
          id={s.id}
          initial={{
            sundayDate: s.sundayDate,
            liturgicalName: s.liturgicalName,
            gospelRef: s.gospelRef,
            usccbUrl: s.usccbUrl,
            color: s.color,
            published: s.published,
            featured: s.featured,
            levels: s.levels,
          }}
        />
      </div>
    </div>
  );
}

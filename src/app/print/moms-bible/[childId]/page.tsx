import { PdfBooklet } from "@/components/moms-bible/PdfBooklet";
import { getMbViewer } from "@/lib/moms-bible/access";
import { loadPdfBook } from "@/lib/moms-bible/pdf-data";
import { canParentPrintPdf } from "@/lib/moms-bible/rules";
import { resolveFamilyPlus } from "@/lib/subscription/entitlements";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import "@/styles/moms-bible-print.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prayer Bible (print)",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ childId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const flag = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) !== "0";

/** Keepsake booklet (design section 8): linked parent with their own Plus only (checked here, on the server). */
export default async function MomsBiblePrintPage({ params, searchParams }: Props) {
  const [{ childId }, sp] = await Promise.all([params, searchParams]);
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) redirect("/account/login");
  if (viewer.kind !== "parent") notFound();
  const child = viewer.children.find((c) => c.id === childId);
  const ownPlus = child ? (await resolveFamilyPlus(viewer.parentId)).isPlus : false;
  const decision = canParentPrintPdf({ linked: Boolean(child), ownPlus });
  if (!decision.ok && decision.status === 404) notFound();
  if (!decision.ok) {
    return (
      <main className="mbp-gate">
        <div className="text-[44px]" aria-hidden>
          💌📖
        </div>
        <h1>Print {child?.displayName}&apos;s Bible with Plus</h1>
        <p>{decision.error}</p>
        <Link href="/subscribe" className="mbp-btn">
          Get Plus
        </Link>
      </main>
    );
  }

  const opt = { me: viewer.parentId, others: flag(sp.others), replies: flag(sp.replies) };
  const book = await loadPdfBook(childId, opt);
  return <PdfBooklet book={book} childId={childId} meParentId={viewer.parentId} opt={opt} />;
}

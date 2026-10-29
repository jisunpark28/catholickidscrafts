import { CardAutoPrint } from "@/components/resource/CardAutoPrint";
import { hasCardOriginal } from "@/lib/resource/card-originals";
import { CARD_ID_RE, cardDownloadPath, cardThumbSrc, getPictureCard } from "@/lib/resource/cards";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Picture card (print)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * One card per page. The printable area of both Letter (8.5×11) and A4 (8.27×11.69) with 0.4in margins
 * is at least 7.47in × 10.2in, so a 4:5 card at 7.4in × 9.25in fits either without scaling.
 */
const CARD_PRINT_CSS = `
@page{size:auto;margin:.4in}
html,body{margin:0;background:#fff}
.card-print{display:flex;justify-content:center;align-items:flex-start;padding:16px 0}
.card-print img{display:block;width:7.4in;height:9.25in;max-width:calc(100vw - 32px);max-height:calc((100vw - 32px)*1.25);object-fit:contain}
@media print{.card-print{padding:0}.card-print img{max-width:100%;max-height:none;break-inside:avoid}}
`;

/** Plus-only print page: just the full-res 4:5 PNG (served by the gated download API), auto-printing. */
export default async function CardPrintPage({ params }: Props) {
  const [{ id: raw }, viewer] = await Promise.all([params, resolveResourceViewer()]);
  const id = decodeURIComponent(raw).toUpperCase();
  const card = CARD_ID_RE.test(id) ? getPictureCard(id) : null;
  if (!card) notFound();

  if (!viewer.isPlus) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#1c1c1c]">Plus feature</h1>
        <p className="mt-3 text-sm text-[#4b5563]">Printing picture cards is part of Plus.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/subscribe" className="rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline">
            Unlock with Plus
          </Link>
          <Link
            href={`/resource?view=cards&card=${card.id}`}
            className="rounded-full border border-[#e7e3de] px-5 py-2.5 text-sm font-medium text-[#1c1c1c] no-underline"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  // Full-res original through the gated API; the preview thumbnail only if the original is not uploaded yet.
  const src = (await hasCardOriginal(card.id)) ? `${cardDownloadPath(card.id)}?inline=1` : cardThumbSrc(card.id);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CARD_PRINT_CSS }} />
      <main className="card-print">
        {/* eslint-disable-next-line @next/next/no-img-element -- gated API image, must not go through the optimizer */}
        <img src={src} alt={card.title} width={1080} height={1350} data-card-print />
      </main>
      <CardAutoPrint />
    </>
  );
}

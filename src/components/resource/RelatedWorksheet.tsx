import type { CardRelatedWorksheet } from "@/lib/resource/card-related";
import Image from "next/image";
import Link from "next/link";

/** Small related-worksheet preview (thumbnail + title + link) under a card's family questions. */
export function RelatedWorksheet({ item }: { item: CardRelatedWorksheet }) {
  return (
    <section aria-labelledby="related-worksheet" className="mt-8 max-w-3xl">
      <h2 id="related-worksheet" className="m-0 font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
        Related worksheet
      </h2>
      <Link
        href={item.href}
        className="mt-3 flex items-center gap-4 rounded-2xl border border-[#f0d9b8] bg-white/90 p-3 no-underline hover:border-[#c9773a] hover:bg-white"
      >
        <span className="block w-20 shrink-0 overflow-hidden rounded-lg border border-[#ece7e1] bg-white sm:w-24">
          {item.image ? (
            <Image
              src={item.image}
              alt={`${item.title} preview`}
              width={240}
              height={311}
              unoptimized
              className="block h-auto w-full"
            />
          ) : (
            <span aria-hidden className="flex aspect-[8.5/11] w-full items-center justify-center bg-[#fffaf4] text-2xl">
              📄
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-[#9a6b3f]">{item.label}</span>
          <span className="mt-0.5 block font-semibold text-[#1f2937]">{item.title}</span>
          <span className="mt-1 block text-sm text-[#335599]">
            Open worksheet →
            {item.access ? (
              <span className="ml-2 text-xs text-[#6b7280]">
                {item.access === "plus" ? "Download with Plus" : "Free download with sign-in"}
              </span>
            ) : null}
          </span>
        </span>
      </Link>
    </section>
  );
}

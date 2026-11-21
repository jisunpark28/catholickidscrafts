import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { VIRTUE_BUNDLES } from "@/lib/virtues";
import { cardThumbSrc } from "@/lib/resource/card-meta";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Virtues for Catholic Kids",
  description:
    "Courage for Catholic kids: Bible stories, a verse from Matthew, real school and home questions, and a virtue worksheet.",
  path: "/virtues",
});

export default function VirtuesPage() {
  return (
    <TestamentPageShell>
      <JsonLd nodes={[breadcrumbNode([{ name: "Virtues", path: "/virtues" }])]} />
      <SidebarPagePanel>
        <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937]">Virtues</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#374151]">
          One virtue at a time: a Bible story, a verse, a real moment from school or home, and a promise you can keep.
        </p>
        <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {VIRTUE_BUNDLES.map((virtue) => {
            const cover = virtue.stories.find((story) => story.cardId)?.cardId;
            return (
              <li key={virtue.slug}>
                <Link
                  href={`/virtues/${virtue.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0d9b8] bg-white no-underline shadow-[0_1px_3px_rgba(28,28,28,0.04)] hover:border-[#c9773a]"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cardThumbSrc(cover)} alt="" width={432} height={540} className="block h-auto w-full" />
                  ) : null}
                  <span className="px-4 py-3">
                    <span className="block font-[Georgia,serif] text-xl font-bold text-[#1f2937]">{virtue.name}</span>
                    <span className="mt-1 block text-sm font-semibold text-[#335599]">Open {virtue.name} →</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </SidebarPagePanel>
    </TestamentPageShell>
  );
}

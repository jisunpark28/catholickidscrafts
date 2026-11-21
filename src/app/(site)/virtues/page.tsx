import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { SidebarPagePanel } from "@/components/SidebarPagePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { VirtueCardGrid } from "@/components/virtues/VirtueCardGrid";
import { VIRTUE_BUNDLES } from "@/lib/virtues";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import type { Metadata } from "next";

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
        <VirtueCardGrid virtues={VIRTUE_BUNDLES} />
      </SidebarPagePanel>
    </TestamentPageShell>
  );
}

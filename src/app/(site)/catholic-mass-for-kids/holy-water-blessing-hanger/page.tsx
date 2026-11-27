import { HomePdfShell } from "@/components/home/HomePdfShell";
import { LockedPreview } from "@/components/resource/LockedPreview";
import { JsonLd } from "@/components/seo/JsonLd";
import { MASS_FOR_KIDS_HUB } from "@/lib/seo/evergreen-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";

const PATH = "/catholic-mass-for-kids/holy-water-blessing-hanger";
const PRINT = "/print/mass-craft/holy-water-blessing-hanger?level=1";

export const metadata: Metadata = pageMetadata({
  title: "Holy Water Blessing Hanger",
  absoluteTitle: true,
  description:
    "Color and cut a holy water door hanger. Sign in to print Level 1 and Level 2. Holy water helps children remember baptism.",
  path: PATH,
});

export default function HolyWaterBlessingHangerPage() {
  return (
    <HomePdfShell groups={[]} printHideNav contentClassName="bg-[#fff8f0]">
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Catholic Mass for Kids", path: MASS_FOR_KIDS_HUB },
            { name: "Holy Water Blessing Hanger", path: PATH },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl rounded-[24px] bg-[#fff3e6] px-6 py-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
          <Link href="/" className="text-[#335599] hover:underline">
            Home
          </Link>
          {" › "}
          <Link href={MASS_FOR_KIDS_HUB} className="text-[#335599] hover:underline">
            Catholic Mass for Kids
          </Link>
          {" › Holy Water Blessing Hanger"}
        </nav>
        <header className="mt-3">
          <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">Holy Water Blessing Hanger</h1>
          <p className="mt-2 text-lg font-semibold text-[#4b5563]">A door hanger to color, cut, and hang.</p>
        </header>
        <p className="mt-3 text-base leading-relaxed text-[#374151]">
          Holy water helps us remember our baptism. When we come into church, we touch the holy water and make the Sign of
          the Cross.
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#374151]">
          Level 1 and Level 2 each have a coloring page and a color page. Sign in to view and print them.
        </p>
        <div className="mt-4 max-w-[220px]">
          <LockedPreview veil="light" href={PRINT} badge="Sign in" label="Sign in to print the holy water blessing hanger">
            <span className="block aspect-[17/22] overflow-hidden bg-white" style={{ filter: "blur(6px)" }} aria-hidden>
              <svg viewBox="0 0 80 110" className="h-full w-full">
                <rect x="18" y="8" width="44" height="94" rx="8" fill="none" stroke="#d1d5db" strokeWidth="2" />
                <circle cx="40" cy="28" r="12" fill="#e8f4fb" stroke="#9ec5db" />
                <path d="M40 48 v16 M32 56 h16" stroke="#e6c15a" strokeWidth="5" strokeLinecap="round" />
                <path d="M40 70 c-6 0 -8 6 -8 10 c0 6 8 12 8 12 c0 0 8 -6 8 -12 c0 -4 -2 -10 -8 -10 z" fill="#7eb6d6" />
              </svg>
            </span>
          </LockedPreview>
        </div>
        <p className="mt-4">
          <Link
            href={PRINT}
            className="inline-flex rounded-full bg-[#2e7d32] px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#256628]"
          >
            Print this hanger
          </Link>
        </p>
        <p className="mt-4 text-base">
          <Link href="/catholic-mass-for-kids/introductory-rites" className="font-semibold text-[#335599] hover:underline">
            Introductory Rites worksheet
          </Link>
          {" · "}
          <Link href="/catholic-mass-for-kids/four-parts-of-the-mass" className="font-semibold text-[#335599] hover:underline">
            All 4 Parts of the Mass for Kids (Guide &amp; Worksheet)
          </Link>
        </p>
      </article>
    </HomePdfShell>
  );
}

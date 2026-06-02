import { LegalPage } from "@/components/LegalPage";
import { getTptStoreUrl } from "@/lib/tpt";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Catholic Kids Crafts — Daily Mass in English, liturgical-season activities, and curated resources for families and catechists.",
};

export default function AboutPage() {
  const tptStore = getTptStoreUrl();

  return (
    <LegalPage
      title="About Catholic Kids Crafts"
      subtitle="Daily Mass, seasonal kids activities, and trusted links for Catholic families and Sunday school."
    >
      <p>
        Catholic Kids Crafts helps parents, homeschoolers, and catechists connect the Church&apos;s
        calendar with hands-on faith formation. We publish{" "}
        <Link href="/mass" className="font-semibold text-[var(--color-link)]">
          Daily Mass readings
        </Link>{" "}
        in English (U.S. lectionary via USCCB where permitted; calendar data via Evangelizo), organize{" "}
        <Link href="/resources" className="font-semibold text-[var(--color-link)]">
          kids crafts and lesson ideas
        </Link>{" "}
        by liturgical season, and share{" "}
        <Link href="/recommendations" className="font-semibold text-[var(--color-link)]">
          books, videos, and supplies
        </Link>{" "}
        we find helpful.
      </p>
      <p>
        Printable packs and classroom-ready bundles are sold on{" "}
        {tptStore ? (
          <a
            href={tptStore}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-link)]"
          >
            Teachers Pay Teachers
          </a>
        ) : (
          "Teachers Pay Teachers (store link coming soon)"
        )}
        . This website offers free previews, planning tools, and links to the full paid downloads.
      </p>
      <h2 className="pt-4 text-xl font-bold">For catechists</h2>
      <p>
        Use the liturgical season filters on Kids Resources to plan Advent, Lent, Easter, and
        Ordinary Time. Pair a Sunday Mass date with an activity that matches the season your class
        is celebrating.
      </p>
      <p className="text-sm text-[var(--color-muted)]">
        Questions about content or permissions? See{" "}
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/affiliate-disclosure" className="text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
        .
      </p>
    </LegalPage>
  );
}

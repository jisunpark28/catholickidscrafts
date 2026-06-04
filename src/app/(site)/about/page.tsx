import { LegalPage } from "@/components/LegalPage";
import { getTptStoreUrl } from "@/lib/tpt";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Catholic Kids Crafts exists—to support children's ministry in parishes and homes across Canada and the United States.",
};

export default function AboutPage() {
  const tptStore = getTptStoreUrl();

  return (
    <LegalPage
      title="Why Catholic Kids Crafts?"
      subtitle="Built to share—so more parishes can run children's programs with confidence."
    >
      <p>
        This site started as a simple wish: make it easier for ordinary volunteers to help with
        faith formation. Not everyone has years of catechesis training. Many of us are parents,
        aides, or parishioners who said &ldquo;yes&rdquo; to Sunday school or a seasonal program—and
        then wondered what to do next.
      </p>
      <p>
        We hope Catholic Kids Crafts lowers that stress for programs in{" "}
        <strong>Canada and the United States</strong>: something you can open on Saturday night or
        ten minutes before class, and actually use.
      </p>

      <h2 className="pt-4 text-xl font-bold">What you will find here</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <Link href="/mass" className="font-semibold text-[var(--color-link)]">
            Daily Mass
          </Link>{" "}
          — see the liturgical day and jump to official readings (Canada or U.S.).
        </li>
        <li>
          <Link href="/resources" className="font-semibold text-[var(--color-link)]">
            Kids Resources
          </Link>{" "}
          — crafts and lesson ideas sorted by Church season.
        </li>
        <li>
          <Link href="/curriculum" className="font-semibold text-[var(--color-link)]">
            Curriculum
          </Link>{" "}
          — longer tracks when you are planning a whole year.
        </li>
        <li>
          <Link href="/play" className="font-semibold text-[var(--color-link)]">
            Play &amp; Learn
          </Link>{" "}
          — short games that fit a class period or family night.
        </li>
        <li>
          <Link href="/recommendations" className="font-semibold text-[var(--color-link)]">
            Recommendations
          </Link>{" "}
          — tools and media we have found helpful (some links may earn a small commission).
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Printables</h2>
      <p>
        Classroom-ready packs live on{" "}
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
          "Teachers Pay Teachers (link coming soon)"
        )}
        . This website stays free for browsing, planning, and games.
      </p>

      <h2 className="pt-4 text-xl font-bold">A note for program leaders</h2>
      <p>
        You do not need to use every section. Pick what matches your parish: maybe Mass + one craft
        for Advent, or Play &amp; Learn for review weeks. If something is confusing or missing for
        your community, we are glad to hear from you through the contact on our{" "}
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy
        </Link>{" "}
        page.
      </p>
      <p className="text-sm text-[var(--color-muted)]">
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy
        </Link>
        {" · "}
        <Link href="/affiliate-disclosure" className="text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
      </p>
    </LegalPage>
  );
}

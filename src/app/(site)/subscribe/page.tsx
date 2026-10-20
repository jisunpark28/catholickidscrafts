import { getPublicContactMailto } from "@/lib/site-contact";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family subscription",
  robots: { index: false },
  ...canonicalForPath("/subscribe"),
};

/** Placeholder until payments exist. Linked from paid-feature upsells (e.g. Bible memos). */
export default function SubscribePage() {
  const mailto = getPublicContactMailto();
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Family subscription</h1>
      <p className="mt-2 text-3xl font-bold text-[var(--color-ink)]">
        $9.99<span className="text-base font-normal text-[var(--color-muted)]">/mo</span>
      </p>
      <p className="mt-4 text-[var(--color-muted)]">
        Typing the Bible stays free. The family subscription adds memos on your favourite passages and
        more family features. Subscriptions are coming soon.
      </p>
      {mailto && (
        <p className="mt-4">
          <a href={`${mailto}?subject=Family%20subscription`} className="font-semibold text-[var(--color-link)]">
            Tell me when it&apos;s ready
          </a>
        </p>
      )}
      <p className="mt-6">
        <Link href="/bible/new-testament" className="font-semibold text-[var(--color-link)]">
          Back to the Bible
        </Link>
      </p>
    </main>
  );
}

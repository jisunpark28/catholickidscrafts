import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reader sign-in",
  description: "Sign in with an Access ID from your parent or teacher.",
  ...canonicalForPath("/reader/login"),
};

export default function ReaderLoginPage() {
  return (
    <PageShell wide>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Reader sign-in</h1>
      <p className="mt-4 max-w-lg text-[var(--color-muted)]">
        Children and students can sign in with an <strong>Access ID</strong> from a family account
        (no email required). Parents sign up at <code>/account/signup</code> (coming soon).
      </p>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        See <code>docs/HOME_LEARN_AND_BIBLE.md</code> for the full auth design (Access ID only for
        subs, max 30 per family).
      </p>
    </PageShell>
  );
}

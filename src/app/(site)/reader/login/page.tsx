import { ReaderLoginForm } from "@/components/ReaderLoginForm";
import { ReaderStatusBar } from "@/components/ReaderStatusBar";
import { PageShell } from "@/components/PageShell";
import { getReaderDisplay } from "@/lib/reader-display";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reader sign-in",
  description: "Sign in with an Access ID from your parent or teacher.",
  ...canonicalForPath("/reader/login"),
};

export default async function ReaderLoginPage() {
  const reader = await getReaderDisplay();

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Reader sign-in</h1>
      <p className="mt-4 max-w-lg text-[var(--color-muted)]">
        Enter the <strong>Access ID</strong> your parent or teacher gave you. No email or password
        needed.
      </p>

      <ReaderStatusBar reader={reader} />

      <div className="mt-8">
        <ReaderLoginForm />
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Parents:{" "}
        <Link href="/account/signup" className="font-semibold text-[var(--color-link)]">
          Create a family account
        </Link>{" "}
        or{" "}
        <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
          sign in
        </Link>{" "}
        to manage Access IDs.
      </p>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mom's Bible emails",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ token?: string; done?: string; invalid?: string }> };

/** Confirm page for turning off reply emails. A plain GET never changes anything. */
export default async function MomsBibleUnsubscribePage({ searchParams }: Props) {
  const { token, done, invalid } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Mom&apos;s Bible reply emails</h1>
      {done ? (
        <p className="mt-4 text-[var(--color-ink)]">
          Done. You won&apos;t get reply emails anymore. Replies still show up in your child&apos;s Bible, and you can turn
          emails back on from <Link href="/account" className="font-semibold text-[var(--color-link)]">your account</Link>.
        </p>
      ) : invalid ? (
        <p className="mt-4 text-[var(--color-muted)]">This link is no longer valid. You can change emails on your account page.</p>
      ) : token ? (
        <form method="post" action="/api/moms-bible/unsubscribe" className="mt-6">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="from" value="page" />
          <p className="mb-4 text-[var(--color-muted)]">Stop emails when your child answers a note?</p>
          <button type="submit" className="bg-[var(--color-accent)] px-6 py-3 font-bold text-white">
            Turn off reply emails
          </button>
        </form>
      ) : (
        <p className="mt-4 text-[var(--color-muted)]">This link is missing its token. Use the link in your email.</p>
      )}
    </div>
  );
}

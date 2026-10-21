import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

/** The button is the one click; a plain GET doesn't unsubscribe so link scanners can't do it by accident. */
export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Unsubscribe from the weekly sheet</h1>
      {token ? (
        <form method="post" action="/api/unsubscribe" className="mt-6">
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="bg-[var(--color-accent)] px-6 py-3 font-bold text-white">
            Unsubscribe
          </button>
        </form>
      ) : (
        <p className="mt-4 text-[var(--color-muted)]">This link is missing its token. Use the link in your email.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly sheet email",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ status?: string }> };

const MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: "You're subscribed!",
    body: "Next week's free Sunday sheet will arrive Friday morning.",
  },
  unsubscribed: {
    title: "You're unsubscribed",
    body: "You won't get the weekly sheet email anymore. The sheets stay free on the site.",
  },
  invalid: {
    title: "That link didn't work",
    body: "It may have been used already or expired. You can sign up again after printing a sheet.",
  },
};

export default async function NewsletterStatusPage({ searchParams }: Props) {
  const { status = "invalid" } = await searchParams;
  const msg = MESSAGES[status] ?? MESSAGES.invalid;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{msg.title}</h1>
      <p className="mt-4 text-[var(--color-muted)]">{msg.body}</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-[var(--color-link)]">
        Back to this Sunday&apos;s sheet
      </Link>
    </div>
  );
}

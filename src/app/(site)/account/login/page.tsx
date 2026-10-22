import { FamilyLoginForm } from "@/components/FamilyLoginForm";
import { PageShell } from "@/components/PageShell";
import { requireParentActive } from "@/lib/family-auth";
import { googleAuthErrorMessage } from "@/lib/google-auth-messages";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parent sign-in",
  // Sign-in screens have no search value; keep them out of the index.
  robots: { index: false, follow: true },
  description: "Sign in to manage family reader profiles and Bible sticker progress.",
  ...canonicalForPath("/account/login"),
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountLoginPage({ searchParams }: Props) {
  // In child mode the parent must sign in again here, so only an active parent is redirected.
  const session = await requireParentActive();
  if (session) redirect("/account");

  const params = await searchParams;
  const googleError = googleAuthErrorMessage(params.error);

  return (
    <PageShell>
      <div className="-mx-4 flex justify-center rounded-2xl bg-[#fbf6f0] px-4 py-10 sm:mx-0 sm:py-16">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--color-link)] no-underline hover:underline"
          >
            ← Home
          </Link>
          <div className="mt-3">
            <FamilyLoginForm error={googleError} />
          </div>
          <p className="mt-4 text-center text-[13px] text-[var(--color-muted)]">
            Plus is CA$5.99/month · cancel anytime
          </p>
        </div>
      </div>
    </PageShell>
  );
}

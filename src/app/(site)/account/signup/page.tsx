import { FamilySignupForm } from "@/components/FamilySignupForm";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { googleAuthErrorMessage } from "@/lib/google-auth-messages";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Family sign-up",
  description: "Create a parent account to manage reader Access IDs and Bible progress.",
  ...canonicalForPath("/account/signup"),
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountSignupPage({ searchParams }: Props) {
  const session = await getFamilySession();
  if (session) redirect("/account");

  const params = await searchParams;
  const googleError = googleAuthErrorMessage(params.error);

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Create family account</h1>
      {googleError && (
        <p className="mt-4 max-w-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {googleError}
        </p>
      )}
      <div className="mt-8">
        <FamilySignupForm />
      </div>
      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}

import { FamilyLoginForm } from "@/components/FamilyLoginForm";
import { GoogleFamilySignIn } from "@/components/GoogleFamilySignIn";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { isGoogleSignInConfigured } from "@/lib/google-oauth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Parent sign-in",
  description: "Sign in to manage family reader profiles and Bible sticker progress.",
  ...canonicalForPath("/account/login"),
};

function googleErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "google_denied":
      return "Google sign-in was canceled.";
    case "google_email_conflict":
      return "This email is already linked to a different Google account.";
    case "google_state":
      return "Sign-in expired. Please try again.";
    case "google_profile":
    case "google_account":
    case "google_missing":
      return "Google sign-in failed. Please try again or use email and password.";
    default:
      return null;
  }
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountLoginPage({ searchParams }: Props) {
  const session = await getFamilySession();
  if (session) redirect("/account");

  const params = await searchParams;
  const googleError = googleErrorMessage(params.error);
  const googleEnabled = isGoogleSignInConfigured();

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Family account</h1>
      {googleError && (
        <p className="mt-4 max-w-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {googleError}
        </p>
      )}
      <div className="mt-8">
        <FamilyLoginForm />
        <GoogleFamilySignIn enabled={googleEnabled} />
      </div>
      <p className="mt-6 text-sm text-[var(--color-muted)]">
        New here?{" "}
        <Link href="/account/signup" className="font-semibold text-[var(--color-link)]">
          Create a family account
        </Link>
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Children use an Access ID at{" "}
        <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
          Reader sign-in
        </Link>
        .
      </p>
    </PageShell>
  );
}

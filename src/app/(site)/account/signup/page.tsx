import { FamilySignupForm } from "@/components/FamilySignupForm";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Family sign-up",
  description: "Create a parent account to manage reader Access IDs and Bible progress.",
  ...canonicalForPath("/account/signup"),
};

export default async function AccountSignupPage() {
  const session = await getFamilySession();
  if (session) redirect("/account");

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Create family account</h1>
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

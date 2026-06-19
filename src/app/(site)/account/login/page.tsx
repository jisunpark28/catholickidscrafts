import { FamilyLoginForm } from "@/components/FamilyLoginForm";
import { PageShell } from "@/components/PageShell";
import { getFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Parent sign-in",
  description: "Sign in to manage family reader profiles and Bible sticker progress.",
  ...canonicalForPath("/account/login"),
};

export default async function AccountLoginPage() {
  const session = await getFamilySession();
  if (session) redirect("/account");

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">Family account</h1>
      <div className="mt-8">
        <FamilyLoginForm />
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

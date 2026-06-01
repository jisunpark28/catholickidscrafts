import { LegalPage } from "@/components/LegalPage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Catholic Kids Crafts handles visitor data and cookies.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" subtitle="Last updated: June 2026">
      <p>
        Catholic Kids Crafts operates <strong>www.catholickidscrafts.com</strong>. This policy
        describes what we collect when you browse the public site.
      </p>

      <h2 className="pt-4 text-xl font-bold">Information we collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Usage analytics:</strong> Aggregated page views and approximate unique visitors per
          day (operator use only).
        </li>
        <li>
          <strong>Visitor identifier:</strong> A random browser identifier (local storage) for
          daily unique visitor counts. No account required.
        </li>
        <li>
          <strong>Admin accounts:</strong> Operator email and hashed password for{" "}
          <code>/admin</code> only.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Third-party services</h2>
      <p>
        Mass readings use the Evangelizo API. Outbound links (YouTube, Amazon, Teachers Pay
        Teachers) have their own policies.
      </p>

      <h2 className="pt-4 text-xl font-bold">Children</h2>
      <p>
        The site is for adults planning activities for children. We do not knowingly collect data
        from children under 13.
      </p>

      <p className="pt-4 text-sm text-[var(--color-muted)]">
        See also{" "}
        <Link href="/about" className="text-[var(--color-link)]">
          About
        </Link>{" "}
        and{" "}
        <Link href="/affiliate-disclosure" className="text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
        .
      </p>
    </LegalPage>
  );
}

import { LegalPage } from "@/components/LegalPage";
import { getPublicContactEmail, getPublicContactMailto } from "@/lib/site-contact";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Catholic Kids Crafts handles visitor data, cookies, and third-party services.",
};

export default async function PrivacyPage() {
  const contactEmail = getPublicContactEmail();
  const contactMailto = getPublicContactMailto();
  const copy = await getSiteCopyMap();

  return (
    <LegalPage
      title={copyText(copy, "legal.privacy.title", "Privacy Policy")}
      subtitle={copyText(copy, "legal.privacy.subtitle", "Last updated: June 2026")}
    >
      <p>
        Catholic Kids Crafts operates{" "}
        <strong>www.catholickidscrafts.com</strong> (the &quot;Site&quot;). This policy describes
        what we collect when you browse the public site, how we use cookies, which third parties
        process data, and how to contact us.
      </p>

      <h2 className="pt-4 text-xl font-bold">Information we collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Usage analytics (aggregated):</strong> Page views and approximate unique visitors
          per calendar day. Operators view totals in <code>/admin</code>; we do not sell this data.
        </li>
        <li>
          <strong>Visitor identifier cookie:</strong> On public pages we set an httpOnly cookie named{" "}
          <code>ckc_vid</code> (random UUID, up to one year) so we can count one visit per browser
          per day. It is not used for advertising profiles. Admin routes do not use this tracker.
        </li>
        <li>
          <strong>Server and hosting logs:</strong> Our host (Vercel) may log IP address, user agent,
          and request metadata for security and reliability, under Vercel&apos;s privacy policy.
        </li>
        <li>
          <strong>Admin accounts:</strong> Operator email and a hashed password for{" "}
          <code>/admin</code> only. Session cookies are managed by our authentication library
          (NextAuth).
        </li>
        <li>
          <strong>Content you do not submit on the public site:</strong> We do not operate a public
          comment form or newsletter signup on the Site at this time.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Cookies and similar technologies</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Essential / analytics:</strong> <code>ckc_vid</code> as described above, set via{" "}
          <code>POST /api/analytics/visit</code> when you change pages on the public site.
        </li>
        <li>
          <strong>Admin session:</strong> Authentication cookies when you sign in at{" "}
          <code>/admin/login</code>.
        </li>
        <li>
          <strong>We do not</strong> run third-party advertising or social-tracking pixels on the
          Site. Embedded YouTube players (when a resource uses a YouTube URL) may set cookies on
          YouTube&apos;s domain if you play a video; see YouTube/Google policies.
        </li>
      </ul>
      <p className="text-sm text-[var(--color-muted)]">
        You can clear or block cookies in your browser settings. Blocking <code>ckc_vid</code> does
        not prevent you from using the Site; it only affects our internal visitor counts.
      </p>

      <h2 className="pt-4 text-xl font-bold">How we use information</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Operate and improve the Site (content, games, Daily Mass calendar).</li>
        <li>Secure admin access and prevent abuse.</li>
        <li>Understand general traffic levels (not individualized marketing).</li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Third-party services</h2>
      <p>We rely on the following categories of providers:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Vercel</strong> — hosting, CDN, and (optionally) file storage (Vercel Blob) for
          uploaded PDFs and images.
        </li>
        <li>
          <strong>Neon</strong> — PostgreSQL database for site content, traffic aggregates, and admin
          users.
        </li>
        <li>
          <strong>USCCB / bible.usccb.org</strong> — Daily Mass reading text when displayed from the
          official USCCB RSS feed (see{" "}
          <Link href="/mass" className="text-[var(--color-link)]">
            Daily Mass
          </Link>
          ). USCCB copyright notices apply to those texts.
        </li>
        <li>
          <strong>Evangelizo.org</strong> — Liturgical calendar titles and reading citations (not
          full-text republication by default). Their API is called from our servers when you open
          Mass pages.
        </li>
        <li>
          <strong>YouTube</strong> — Embedded players on some resource pages when operators link a
          video URL.
        </li>
        <li>
          <strong>Amazon, Teachers Pay Teachers, and other outbound links</strong> — When you click
          recommendations or store links, those sites&apos; policies apply. Amazon Associate links
          are disclosed on{" "}
          <Link href="/affiliate-disclosure" className="text-[var(--color-link)]">
            Affiliate disclosure
          </Link>
          .
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Data retention</h2>
      <p>
        Traffic aggregates are kept in our database for operator reporting. The <code>ckc_vid</code>{" "}
        cookie expires after about one year unless you clear it sooner. Admin account data remains
        until an operator removes it.
      </p>

      <h2 className="pt-4 text-xl font-bold">Children</h2>
      <p>
        The Site is intended for adults planning activities for children. We do not knowingly
        collect personal information directly from children under 13. If you believe a child provided
        personal data to us, contact us below and we will delete it where appropriate.
      </p>

      <h2 className="pt-4 text-xl font-bold">Your choices</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, or delete personal
        data we hold about you (primarily relevant for admin accounts). For public analytics we store
        only a pseudonymous visitor id and daily counts, not your name.
      </p>

      <h2 className="pt-4 text-xl font-bold">Contact</h2>
      <p>
        Questions about this policy or data practices:
        {contactMailto ? (
          <>
            {" "}
            <a href={contactMailto} className="font-semibold text-[var(--color-link)]">
              {contactEmail}
            </a>
          </>
        ) : (
          <>
            {" "}
            email the site operator at the address published on{" "}
            <Link href="/about" className="text-[var(--color-link)]">
              About
            </Link>{" "}
            (set <code>NEXT_PUBLIC_CONTACT_EMAIL</code> in production to display it here).
          </>
        )}
        .
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

import { LegalPage } from "@/components/LegalPage";
import { getPublicContactEmail, getPublicContactMailto } from "@/lib/site-contact";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Catholic Kids Crafts handles visitor data, cookies, and third-party services.",
  ...canonicalForPath("/privacy"),
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
          <strong>Family accounts (optional):</strong> Parents may create an account at{" "}
          <code>/account/signup</code> with email and a hashed password. We store reader display
          names, Access ID hashes (not plain Access IDs), and Bible chapter completion counts for
          sticker progress. Children sign in with an Access ID only—no child email is collected.
        </li>
        <li>
          <strong>Google sign-in (optional):</strong> If enabled, parents may use Google OAuth on{" "}
          <code>/account/login</code>. We receive your Google account ID, verified email, and
          display name from Google&apos;s OpenID service. We do not receive your Google password.
          See <code>docs/FAMILY_GOOGLE_SIGNIN.md</code> for operator setup.
        </li>
        <li>
          <strong>Home search:</strong> Queries you type on the home page are sent to our server to
          search published resources, curriculum, games, and Bible titles. We do not log search
          queries for advertising.
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
          <strong>Family / reader sessions:</strong> <code>ckc_family</code>, <code>ckc_reader</code>
          , and <code>ckc_bible_reader</code> for optional Bible sticker progress (see above).
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
          <strong>Google</strong> — Optional parent sign-in (OAuth) when operators enable it; see
          our family account privacy notes above.
        </li>
        <li>
          <strong>Evangelizo.org</strong> — Liturgical day titles on the{" "}
          <Link href="/mass" className="text-[var(--color-link)]">
            Daily Mass
          </Link>{" "}
          calendar. Our servers call their Reader API when you view that calendar. We do not
          republish full lectionary text from Evangelizo on public pages by default.
        </li>
        <li>
          <strong>USCCB / bible.usccb.org</strong> — The Daily Mass page links out to the official
          USCCB Daily Readings site for full texts. We do not display USCCB reading bodies on
          public HTML pages. USCCB and CCD copyrights apply on their site.
        </li>
        <li>
          <strong>Living with Christ (Bayard)</strong> — Optional outbound links from Daily Mass to{" "}
          <code>readings.livingwithchrist.ca</code>. We do not host or scrape their reading text.
        </li>
        <li>
          <strong>GoodNews (서울대교구)</strong> — Optional outbound links from Daily Mass to{" "}
          <code>maria.catholic.or.kr</code> for Korean daily Mass texts. We do not host or scrape
          their reading text.
        </li>
        <li>
          <strong>Universalis (universalis.com)</strong> — The Play → Typing → &quot;Today&apos;s
          Bible&quot; mode loads <strong>today&apos;s</strong> Mass readings via Universalis&apos;s
          JSONP service for webmasters. Reading text appears on that game page with
          Universalis&apos;s copyright notice and links back to Universalis. This uses a different
          calendar/translation than the U.S. USCCB lectionary.
        </li>
        <li>
          <strong>YouTube</strong> — Embedded players on some resource pages when operators link a
          video URL.
        </li>
        <li>
          <strong>Operator-uploaded content</strong> — PDFs, images, and lesson text posted by
          site operators (Kids Resources, Curriculum, etc.) are the responsibility of the publisher
          who uploaded them. Do not reuse those materials without permission from the rights holder.
        </li>
        <li>
          <strong>Amazon, Teachers Pay Teachers, and other outbound links</strong> — When you click
          recommendations or store links, those sites&apos; policies apply. Amazon links may be
          marked as Associate links when configured; see{" "}
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

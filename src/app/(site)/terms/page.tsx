import { LegalPage } from "@/components/LegalPage";
import { getPublicContactEmail, getPublicContactMailto } from "@/lib/site-contact";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "How you may use Catholic Kids Crafts, including content, Mass reading links, and affiliate disclosures.",
  ...canonicalForPath("/terms"),
};

export default async function TermsPage() {
  const contactEmail = getPublicContactEmail();
  const contactMailto = getPublicContactMailto();
  const copy = await getSiteCopyMap();

  return (
    <LegalPage
      title={copyText(copy, "legal.terms.title", "Terms of Use")}
      subtitle={copyText(copy, "legal.terms.subtitle", "Last updated: September 2026")}
    >
      <p>
        These Terms of Use describe how you may use{" "}
        <strong>www.catholickidscrafts.com</strong> (the &quot;Site&quot;). The Site is a
        free educational resource for Catholic families, catechists, and parish volunteers
        planning activities for children. By using the Site, you agree to these terms.
      </p>
      <p className="text-sm text-[var(--color-muted)]">
        This page is written in plain language for families. It is not a substitute for legal
        advice and has not been reviewed by a lawyer.
      </p>

      <h2 className="pt-4 text-xl font-bold">Educational use</h2>
      <p>
        You may browse, print, and use materials on the Site for personal, family, classroom, and
        parish education. Do not scrape the Site, resell our pages or downloads, or present our
        operator-uploaded crafts and lessons as a commercial product of your own. Paid printable
        packs sold on Teachers Pay Teachers follow TPT&apos;s terms, not a blanket license from
        this Site.
      </p>

      <h2 className="pt-4 text-xl font-bold">Operator-uploaded content</h2>
      <p>
        Crafts, PDFs, images, curriculum, and lesson text posted by site operators remain the
        responsibility of the publisher who uploaded them. Display on this Site does not transfer
        copyright to you. Do not reuse those materials beyond ordinary classroom or family use
        without permission from the rights holder.
      </p>

      <h2 className="pt-4 text-xl font-bold">Mass readings and other publishers</h2>
      <p>
        Daily Mass titles on the calendar are provided as a planning aid. Full lectionary text is
        copyrighted by the publishers who own it. We do not republish USCCB, Living with Christ
        (Bayard), or GoodNews (서울대교구) reading bodies on public pages; those buttons open the
        publisher&apos;s site, and their copyrights and terms apply there. &quot;Today&apos;s
        Bible&quot; typing uses Universalis&apos;s webmaster service for today&apos;s readings only,
        with Universalis&apos;s copyright notice and a link back to Universalis. That text may use
        a different calendar or translation than the U.S. USCCB lectionary.
      </p>

      <h2 className="pt-4 text-xl font-bold">Affiliate links</h2>
      <p>
        Some Recommendations and store links may earn a commission. See our{" "}
        <Link href="/affiliate-disclosure" className="text-[var(--color-link)]">
          Affiliate disclosure
        </Link>
        .
      </p>

      <h2 className="pt-4 text-xl font-bold">Disclaimer</h2>
      <p>
        The Site is provided for informal faith-formation support. It is not official catechesis,
        liturgical law, or professional advice. Calendar titles, games, and downloads are
        offered as-is; always confirm Mass texts and parish practice with your diocese or pastor
        when it matters.
      </p>

      <h2 className="pt-4 text-xl font-bold">Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, Catholic Kids Crafts and its operators are not
        liable for losses arising from use of the Site, downloads, games, camera or microphone
        features, or third-party sites we link to (including Mass reading publishers, Amazon,
        Teachers Pay Teachers, YouTube, and hosting providers). You use outbound sites under
        those sites&apos; own terms.
      </p>

      <h2 className="pt-4 text-xl font-bold">Privacy</h2>
      <p>
        How we handle cookies, family accounts, and Access IDs is described in our{" "}
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className="pt-4 text-xl font-bold">Contact</h2>
      <p>
        Questions about these terms:
        {contactMailto && contactEmail ? (
          <>
            {" "}
            <a href={contactMailto} className="font-semibold text-[var(--color-link)]">
              {contactEmail}
            </a>
            .
          </>
        ) : (
          <> Contact unavailable.</>
        )}
      </p>

      <p className="pt-4 text-sm text-[var(--color-muted)]">
        See also{" "}
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy
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

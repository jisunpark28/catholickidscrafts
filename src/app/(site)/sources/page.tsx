import { LegalPage } from "@/components/LegalPage";
import { getPublicContactEmail, getPublicContactMailto } from "@/lib/site-contact";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sources & Copyright",
  description:
    "Where the Scripture, prayers, calendar data, saint facts, illustrations and fonts on Catholic Kids Crafts come from.",
  ...canonicalForPath("/sources"),
};

const linkClass = "text-[var(--color-link)]";

function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

/** The one place on the site for sources, credits and copyright (see docs/legal/COPYRIGHT_AND_DOCTRINE_CONSTITUTION.md §5). */
export default function SourcesPage() {
  const contactEmail = getPublicContactEmail();
  const contactMailto = getPublicContactMailto();

  return (
    <LegalPage title="Sources & Copyright" subtitle="Last updated: November 2026">
      <p>
        This page lists where the content on <strong>www.catholickidscrafts.com</strong> comes
        from. It is the one place for sources, credits and copyright on the Site, so individual
        pages, cards, prayers and printables do not carry their own source lines.
      </p>

      <h2 className="pt-4 text-xl font-bold">Scripture</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          Bible verses on cards, prayer pages and printables are short, individual quotations,
          mostly from the New American Bible, Revised Edition (NABRE). Read the full text on the{" "}
          <External href="https://bible.usccb.org/">USCCB Bible site</External>. We do not
          reproduce a whole Bible translation.
        </li>
        <li>
          The Bible reading and typing pages use the Douay-Rheims Bible, a public-domain
          translation, loaded from latinprayer.org and lightly modernized for easier reading. Chapter
          and verse numbers follow current Catholic numbering.
        </li>
        <li>
          Daily Mass pages link to the official reading sites of the USCCB, Living with Christ
          (Bayard) and GoodNews (Archdiocese of Seoul). We do not republish their reading text;
          their copyrights and terms apply on their sites.
        </li>
        <li>
          &quot;Today&apos;s Bible&quot; typing loads today&apos;s Mass readings from{" "}
          <External href="https://universalis.com/">Universalis</External> through its service for
          webmasters. The text appears with Universalis&apos;s own copyright notice and a link back
          to Universalis, and may follow a different calendar or translation than the U.S.
          lectionary.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Prayers</h2>
      <p>
        Prayer pages, cards and printables use the traditional wording of common Catholic prayers,
        as published by the Church: for example the USCCB&apos;s prayer pages, the United States
        Catholic Catechism for Adults, the Compendium of the Catechism of the Catholic Church, and
        The Roman Missal (English translation, 2011).
      </p>

      <h2 className="pt-4 text-xl font-bold">Church teaching</h2>
      <p>
        Explanations of the faith are written in our own words for children, based on the
        Catechism of the Catholic Church and its Compendium. We do not copy Catechism text.
      </p>

      <h2 className="pt-4 text-xl font-bold">Liturgical calendar and saints</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          Liturgical day titles on the{" "}
          <Link href="/daily-mass" className={linkClass}>
            Daily Mass
          </Link>{" "}
          calendar come from <External href="https://evangelizo.org/">Evangelizo.org</External>.
          The Site also uses the open-source romcal library for liturgical dates.
        </li>
        <li>
          Saint stories and facts are written in our own words from sources such as the Vatican and
          Vatican News, Franciscan Media, the USCCB and christianiconography.info.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Illustrations and artwork</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          Illustrations on this Site (cards, prayer pictures, thumbnails, previews and printables)
          are created with AI image-generation tools and edited by Catholic Kids Crafts.
        </li>
        <li>
          Masterpiece cards show public-domain paintings, whole and unaltered.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Fonts and software</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          The Site uses the Fredoka and Inter typefaces under the SIL Open Font License 1.1.
          Printable worksheets use the Baloo 2 and Comic Relief typefaces.
        </li>
        <li>The Face to Emoji and Tiny Priest games are released under the MIT License.</li>
      </ul>

      <h2 className="pt-4 text-xl font-bold">Materials on this Site</h2>
      <p>
        © 2026 Catholic Kids Crafts. All rights reserved. Crafts, PDFs, images, curriculum and
        lesson text posted by site operators remain the responsibility of the publisher who uploaded
        them. Display on this Site does not transfer copyright to you. Do not reuse those materials
        beyond ordinary classroom or family use without permission from the rights holder. How you
        may use the Site is described in our{" "}
        <Link href="/terms" className={linkClass}>
          Terms of Use
        </Link>
        .
      </p>

      <h2 className="pt-4 text-xl font-bold">Corrections</h2>
      <p>
        If something on this page is missing or wrong, or you have a concern about material on the
        Site, please write to us
        {contactMailto && contactEmail ? (
          <>
            {" "}
            at{" "}
            <a href={contactMailto} className="font-semibold text-[var(--color-link)]">
              {contactEmail}
            </a>
            .
          </>
        ) : (
          <>.</>
        )}
      </p>

      <p className="pt-4 text-sm text-[var(--color-muted)]">
        See also{" "}
        <Link href="/terms" className={linkClass}>
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className={linkClass}>
          Privacy
        </Link>
        .
      </p>
    </LegalPage>
  );
}

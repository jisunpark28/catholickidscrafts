import { LockedPreview } from "@/components/resource/LockedPreview";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { liveResources, MASS_PARTS } from "@/data/mass-parts-curriculum";
import { Level2AnswerKey } from "@/components/seo/Level2AnswerKey";
import { massLevel2AnswerKey } from "@/data/mass-sheet-notes";
import { FOUR_PARTS_H1, MASS_FOR_KIDS_HUB, getEvergreenSheet, printPath, relatedCards } from "@/lib/seo/evergreen-worksheets";
import { getEvergreenPageBySlug } from "@/lib/evergreen-catalog";
import Link from "next/link";

const h2 = "font-[Georgia,serif] text-xl font-bold text-[#1f2937]";
const h3 = "font-[Georgia,serif] text-lg font-bold text-[#1f2937]";
const body = "mt-2 text-base leading-relaxed text-[#374151]";
const card = "rounded-2xl border border-[#f0d9b8] bg-white p-4";

const LAYOUT = [
  ["Altar", "The altar stands at the center. The sacrifice of the Cross is made present there under the signs of bread and wine."],
  ["Tabernacle", "The tabernacle holds the consecrated Host. Jesus is really present there, and we can adore him."],
  ["Ambo", "The ambo is the place for Scripture."],
  ["Baptismal Font", "The font marks the beginning of life in Christ."],
  ["Holy Water & Sign of the Cross", "We sign ourselves and remember that baptism began our life in Christ."],
  ["Bethlehem & the Altar", "Bethlehem means “house of bread.” We welcome the child Jesus with a humble heart, and at the altar he gives himself to us as the Bread of Life."],
] as const;

const POSTURE = [
  "We stand to begin, to hear the Gospel, and to pray together.",
  "We sit for the readings before the Gospel and for the homily.",
  "We kneel during the Eucharistic Prayer and before Communion, following our parish custom.",
  "Anyone who cannot kneel bows instead.",
  "Amen means “yes, this prayer is ours.”",
];

const VESSELS = [
  "The priest pours wine and a little water into the chalice. Jesus became one of us, and he shares his life with us.",
  "He then washes his hands. That is a prayer for a clean heart.",
  "At the consecration the bread and wine become Christ’s Body and Blood. The Church calls this transubstantiation.",
  "Christ is present whole and entire under the form of bread, and whole and entire under the form of wine.",
  "The tabernacle keeps consecrated Hosts for the sick and for adoration outside Mass.",
];

const COLORS = [
  "White: Easter, Christmas, and many feasts of the Lord, of Mary, and of saints who were not martyrs.",
  "Green: Ordinary Time.",
  "Violet: Advent and Lent.",
  "Red: Palm Sunday, Good Friday, Pentecost, the Lord’s Passion, the Apostles, and the martyrs.",
  "Rose may be used on Gaudete Sunday, the Third Sunday of Advent, and on Laetare Sunday, the Fourth Sunday of Lent.",
  "On solemn feast days, gold or festive vestments may also be worn.",
];

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-[#374151]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Long guide for /catholic-mass-for-kids/four-parts-of-the-mass only. */
export function FourPartsGuide() {
  const page = getEvergreenPageBySlug("four-parts-of-the-mass");
  const sheet = getEvergreenSheet("MASS_PARTS");
  const cards = page ? relatedCards(page) : [];
  const answerKey = sheet ? massLevel2AnswerKey(sheet) : [];

  return (
    <article className="mx-auto max-w-6xl rounded-[24px] bg-[#fff3e6] px-6 py-6 lg:px-10 lg:py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/" className="text-[#335599] hover:underline">
          Home
        </Link>{" "}
        ›{" "}
        <Link href={MASS_FOR_KIDS_HUB} className="text-[#335599] hover:underline">
          Catholic Mass for Kids
        </Link>{" "}
        › Four Parts of the Mass
      </nav>

      <header className="mt-3">
        <h1 className="font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{FOUR_PARTS_H1}</h1>
        <p className="mt-2 text-lg font-semibold text-[#4b5563]">
          Order of the Catholic Mass explained for First Communion prep, family Mass prep, and parish classes.
        </p>
      </header>

      <p className={body}>This page walks through the Mass in order.</p>

      <section className="mt-8" aria-labelledby="four-parts">
        <h2 id="four-parts" className={h2}>
          The 4 Parts of the Catholic Mass in Order
        </h2>
        <p className={body}>The Word and the Eucharist are the two main parts, and they are one act of worship.</p>
        <ol className="mt-4 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {MASS_PARTS.map((part) => (
            <li key={part.id} className={card}>
              <h3 className="m-0 font-[Georgia,serif] text-lg font-bold text-[#1f2937]">
                {part.order}. {part.title}
              </h3>
              <p className="mt-2 text-sm text-[#374151]">
                <span className="font-semibold text-[#9a6b3f]">Posture. </span>
                {part.posture}
              </p>
              <p className="mt-1 text-sm text-[#374151]">
                <span className="font-semibold text-[#9a6b3f]">Our response. </span>
                {part.kidResponse}
              </p>
              <ul className="mt-3 space-y-2">
                {part.keyThemes.map((theme) => (
                  <li key={theme.label} className="text-sm leading-relaxed text-[#374151]">
                    <span className="font-semibold">{theme.label}. </span>
                    {theme.kidNote}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-[#374151]">
                <span className="font-semibold text-[#9a6b3f]">Spot at church: </span>
                {part.whatToSpot.join(" · ")}
              </p>
              {liveResources(part).length ? (
                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                  {liveResources(part).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 rounded-full border border-[#c9773a] bg-[#fff8f0] px-3 py-1 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-white"
                      >
                        {item.label}
                        {item.tier === "signin" ? (
                          <span className="rounded-full bg-[#e8f5e9] px-2 py-0.5 text-xs font-bold text-[#256628]">
                            Sign in to print
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section id="layout-vessels" className="mt-8" aria-labelledby="layout-vessels-title">
        <h2 id="layout-vessels-title" className={h2}>
          Church Layout, Reconciliation, Sacred Vessels &amp; Liturgical Colors
        </h2>

        <h3 className={`${h3} mt-4`}>Church layout and a ready heart</h3>
        <ul className="mt-3 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {LAYOUT.map(([label, text]) => (
            <li key={label} className={card}>
              <p className="m-0 text-base leading-relaxed text-[#374151]">
                <span className="font-bold text-[#1f2937]">{label}. </span>
                {text}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className={card} aria-labelledby="penance-title">
            <h3 id="penance-title" className={h3}>
              Sacrament of Penance and Reconciliation
            </h3>
            <p className={body}>God meets us when we come back, even if it has been a while.</p>
            <p className={body}>An accidental slip is not the same as a choice we knew was wrong.</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-relaxed text-[#374151]">
              <li>Examination of conscience: we look at our week in the light of the Gospel.</li>
              <li>Confession and receiving a penance: we tell our sins to the priest, and he gives a penance.</li>
              <li>Act of Contrition and absolution: we say we are sorry, and the priest absolves us.</li>
              <li>Completing the penance and living love: we do the penance afterward and try to make peace.</li>
            </ol>
            <p className={body}>
              Penance is given before absolution and completed afterward. The short prayer for mercy at the start of Mass is
              not confession, and it does not forgive serious sin.
            </p>
          </section>

          <section className={card} aria-labelledby="posture-title">
            <h3 id="posture-title" className={h3}>
              Attitude and posture
            </h3>
            <BulletList items={POSTURE} />
          </section>

          <section className={card} aria-labelledby="vessels-title">
            <h3 id="vessels-title" className={h3}>
              Sacred vessels and Eucharistic signs
            </h3>
            <BulletList items={VESSELS} />
          </section>

          <section className={card} aria-labelledby="colors-title">
            <h3 id="colors-title" className={h3}>
              Liturgical colors
            </h3>
            <BulletList items={COLORS} />
          </section>
        </div>
      </section>

      <section id="verse-card" className="mt-8 rounded-2xl border border-[#f0d9b8] bg-white p-4" aria-labelledby="verse-card-title">
        <h2 id="verse-card-title" className={h2}>
          A verse to carry home
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-[#1f2937]">Jesus sends us to share the good news with the whole world.</p>
        <p className="mt-1 text-sm text-[#6b7280]">Mark 16:15</p>
      </section>

      <section id="lesson-guide" className="mt-8" aria-labelledby="lesson-guide-title">
        <h2 id="lesson-guide-title" className={h2}>
          Quick Catechist &amp; Family Lesson Guide (15 Min)
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-relaxed text-[#374151]">
          <li>Name the four parts in order, and point out the two main parts in the middle.</li>
          <li>Walk the church with your eyes: altar, tabernacle, chair, ambo, and font.</li>
          <li>Practice one posture (stand, sit, or kneel) and one Amen.</li>
          <li>Ask: after Mass, whom can we love this week?</li>
        </ol>
        <p className={body}>
          Pew tip: if a child cannot kneel, a deep bow is a real way to adore. Follow the priest or deacon’s direction so the
          whole church prays with one body.
        </p>
      </section>

      <section id="worksheet-card" className="mt-8" aria-labelledby="worksheet-card-title">
        <h2 id="worksheet-card-title" className={h2}>
          Print this worksheet
        </h2>
        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-[#f0d9b8] bg-white p-4 md:flex-row md:items-center">
          <div className="w-full max-w-[220px] shrink-0">
            <LockedPreview
              veil="light"
              href="/subscribe"
              className="rounded-xl border border-[#ece7e1] bg-white"
              label="Level 1 and Level 2 worksheets for the four parts of the Mass"
            >
              <span className="block aspect-[17/22] overflow-hidden p-[8%]" style={{ filter: "blur(3px)" }}>
                <span className="mx-auto mb-[12%] block h-5 w-3/4 rounded bg-[#6b7280]" />
                {[0, 1, 2].map((section) => (
                  <span key={section} className="mb-[10%] block rounded-lg border border-[#9ca3af] p-[6%]">
                    <span className="mb-3 block h-3 w-1/2 rounded bg-[#6b7280]" />
                    {[0, 1, 2, 3].map((line) => (
                      <span key={line} className="mb-2 block h-2 rounded bg-[#9ca3af]" />
                    ))}
                  </span>
                ))}
              </span>
            </LockedPreview>
          </div>
          <div>
            <p className="m-0 text-base leading-relaxed text-[#374151]">
              Includes both Level 1 and Level 2. Preview and printing are included with Plus.
            </p>
            <p className="mt-3">
              <Link
                href={printPath(getEvergreenPageBySlug("four-parts-of-the-mass")!, 1, true)}
                className="inline-flex rounded-full bg-[#2e7d32] px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#256628]"
              >
                Print this worksheet
              </Link>
            </p>
          </div>
        </div>
        <Level2AnswerKey lines={answerKey} />
      </section>

      <section className="mt-8" aria-labelledby="quick-faq">
        <h2 id="quick-faq" className={h2}>
          Quick FAQ
        </h2>
        <h3 className={`${h3} mt-4`}>What are the 4 parts of the Catholic Mass in order?</h3>
        <p className={body}>
          Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, and Concluding Rites. The Word and the Eucharist are
          the two main parts, and they form one act of worship.
        </p>
        <h3 className={`${h3} mt-4`}>Why does the priest mix a drop of water into the wine and wash his hands at Mass?</h3>
        <p className={body}>
          He pours a little water into the wine. We can tell children that Jesus became one of us and shares his life with us.
          He then washes his hands as a prayer that his heart will be clean for the offering.
        </p>
        <h3 className={`${h3} mt-4`}>Can parents or catechists print Level 1 and Level 2?</h3>
        <p className={body}>
          Level 1 is for younger children and Level 2 is for older children, including First Communion prep. Preview and
          printing are included with Plus.
        </p>
      </section>

      {cards.length ? (
        <section className="mt-8" aria-labelledby="cards">
          <h2 id="cards" className={h2}>
            Related picture cards
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#374151]">
            {cards.map((cardItem) => (
              <li key={cardItem.id}>
                <span className="font-semibold">{cardItem.title}</span>
                {" — "}
                {cardItem.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedLinks
        links={[
          { href: MASS_FOR_KIDS_HUB, label: "All Mass worksheets" },
          { href: "/daily-mass", label: "Today's Mass readings for kids" },
          { href: "/bible-verses-for-kids", label: "Bible verses for kids" },
          { href: "/qa-cards", label: "Catholic Q&A cards" },
        ]}
      />

      <div className="mt-10">
        <NewsletterSubscribeForm source="catholic-mass-for-kids" />
      </div>
    </article>
  );
}

import { LockedSheetPreview } from "@/components/resource/LockedSheetPreview";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { liveResources, MASS_PARTS } from "@/data/mass-parts-curriculum";
import { FOUR_PARTS_H1, MASS_FOR_KIDS_HUB, printPath, relatedCards } from "@/lib/seo/evergreen-worksheets";
import { getEvergreenPageBySlug } from "@/lib/evergreen-catalog";
import Link from "next/link";

const h2 = "font-[Georgia,serif] text-xl font-bold text-[#1f2937]";
const h3 = "mt-4 font-[Georgia,serif] text-lg font-bold text-[#1f2937]";
const body = "mt-2 text-base leading-relaxed text-[#374151]";

const SOURCES = [
  {
    label: "Catechism of the Catholic Church 1181–1186, 1346, 1374–1379, 1422, 1450–1460, 1677",
    href: "https://www.vatican.va/content/catechism/en.html",
  },
  {
    label: "General Instruction of the Roman Missal 28, 42–44, 76, and 90",
    href: "https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-2",
  },
  {
    label: "General Instruction of the Roman Missal 142 (a little water in the wine)",
    href: "https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-4",
  },
  {
    label: "General Instruction of the Roman Missal 345–346 (vestment colors)",
    href: "https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-6",
  },
  {
    label: "Mark 16:15, New American Bible, revised edition",
    href: "https://bible.usccb.org/bible/mark/16",
  },
] as const;

/** Long guide for /catholic-mass-for-kids/four-parts-of-the-mass only. */
export function FourPartsGuide() {
  const page = getEvergreenPageBySlug("four-parts-of-the-mass");
  const cards = page ? relatedCards(page) : [];

  return (
    <article className="mx-auto max-w-3xl rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
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
          Order of the Catholic Mass explained for First Communion prep, family Mass prep, parish CCD, and Grades 1–5 faith formation.
        </p>
      </header>

      <p className={body}>
        The parts of the Mass for kids are easy to follow when we walk through the four parts of the Catholic Mass in order.
        This guide is for First Communion prep at home, in a parish, or in a classroom. The Liturgy of the Word and the Liturgy
        of the Eucharist are the two main central parts. They belong together as one act of worship. The Introductory Rites open
        that worship, and the Concluding Rites send us out.
      </p>

      <section className="mt-8" aria-labelledby="four-parts">
        <h2 id="four-parts" className={h2}>
          The 4 Parts of the Catholic Mass in Order
        </h2>
        <p className={body}>
          Children learn four parts, in this order. Inside that order, the Word and the Eucharist are the two parts the Church
          calls the heart of the Mass.
        </p>
        <ol className="mt-4 space-y-4">
          {MASS_PARTS.map((part) => (
            <li key={part.id} className="rounded-2xl border border-[#f0d9b8] bg-white p-4">
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
                        className="inline-flex rounded-full border border-[#c9773a] bg-[#fff8f0] px-3 py-1 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#6b7280]">Worksheet page is not published yet.</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section id="layout-vessels" className="mt-8" aria-labelledby="layout-vessels-title">
        <h2 id="layout-vessels-title" className={h2}>
          Church Layout, Reconciliation, Sacred Vessels &amp; Liturgical Colors
        </h2>

        <h3 className={h3}>Church layout and a ready heart</h3>
        <p className={body}>
          A Catholic church is a house of prayer. The altar stands at the center, because that is where the sacrifice of the
          Cross is made present under the signs of bread and wine. The tabernacle is given a worthy place so we can adore Jesus,
          really present in the Blessed Sacrament. The priest’s chair shows that he presides and leads the prayer. The ambo is
          the fitting place for Scripture. The baptismal font, and the holy water font that helps us remember our baptism, mark
          the door of Christian life.
        </p>
        <p className={body}>
          Holy water and the Sign of the Cross are sacramentals, sacred signs the Church gives us. We sign ourselves in the name
          of the Trinity and remember that baptism began our life in Christ.
        </p>
        <p className={body}>
          The name Bethlehem is often explained as “house of bread.” That is a meaning of the town’s name, not a sentence of the
          Catechism. It is a gentle picture for children: the child Jesus, born in a humble place, later gives himself to us as
          the Bread of Life. We do not need a manger craft to remember that welcome.
        </p>

        <h3 className={h3}>Sacrament of Penance and Reconciliation</h3>
        <p className={body}>
          It is all right if it has been a while. God meets us when we come back. An accidental slip is not the same thing as a
          choice we knew was wrong. The Church names this sacrament Penance and Reconciliation. Four steps help children
          remember the way:
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-base leading-relaxed text-[#374151]">
          <li>Examination of conscience: we look at our week in the light of the Gospel.</li>
          <li>Confession and receiving a penance: we tell our sins to the priest, and he gives a penance.</li>
          <li>Act of Contrition and absolution: we say we are sorry, and the priest absolves us.</li>
          <li>Completing the penance and living love: we do the penance afterward and try to make peace.</li>
        </ol>
        <p className={body}>
          Penance is given before absolution and completed afterward. Absolution takes the sin away. The penance is how we keep
          healing the harm sin caused. The priest’s words of pardon at the beginning of Mass are not this sacrament. They do not
          forgive serious sin the way confession does.
        </p>

        <h3 className={h3}>Attitude and posture</h3>
        <p className={body}>
          Standing, sitting, and kneeling are one prayer we make with our bodies. We stand to begin, to hear the Gospel, and to
          pray as one people. We sit to listen to the readings before the Gospel and to the homily. In the United States we kneel
          after the Holy, Holy, Holy until the Amen of the Eucharistic Prayer, and we kneel again at the Lamb of God unless the
          bishop has directed otherwise. People who cannot kneel bow instead. Silence and singing belong in the celebration too.
          Amen means “yes, we make this prayer our own.”
        </p>

        <h3 className={h3}>Sacred vessels and Eucharistic signs</h3>
        <p className={body}>
          At the preparation of the gifts, the priest pours wine and a little water into the chalice. A simple way to tell
          children is this: Jesus became one of us, and he shares his life with us. The quiet prayer the priest says then is not
          printed here. Afterward he washes his hands at the side of the altar. That washing is a prayer for a clean heart, not
          a scrub of dirty fingers only.
        </p>
        <p className={body}>
          At the consecration the bread and wine become Christ’s Body and Blood. The Church calls that change transubstantiation.
          Christ is present whole and entire under the form of bread alone, and whole and entire under the form of wine. The
          tabernacle normally keeps consecrated Hosts so Communion can be taken to the sick and so we can adore the Lord outside
          Mass.
        </p>

        <h3 className={h3}>Liturgical colors</h3>
        <p className={body}>
          Vestment colors help us see the season. White is for Easter, Christmas, and many feasts of the Lord, of Mary, and of
          saints who were not martyrs. Green is for Ordinary Time. Violet, or purple, is for Advent and Lent. Red is for Palm
          Sunday, Good Friday, Pentecost, and celebrations of the Lord’s Passion, the Apostles, and the martyrs. Rose may be used
          on Gaudete Sunday, the Third Sunday of Advent, and on Laetare Sunday, the Fourth Sunday of Lent. On more solemn days,
          more precious vestments may be worn even if they are not the color of the day. In the United States, gold or silver may
          be worn on those solemn occasions.
        </p>
      </section>

      <section id="verse-card" className="mt-8 rounded-2xl border border-[#f0d9b8] bg-white p-4" aria-labelledby="verse-card-title">
        <h2 id="verse-card-title" className={h2}>
          A verse to carry home
        </h2>
        <p className="mt-3 font-[Georgia,serif] text-lg leading-relaxed text-[#1f2937]">
          “Go into the whole world and proclaim the gospel to every creature.”
        </p>
        <p className="mt-1 text-sm text-[#6b7280]">Mark 16:15</p>
        <p className={body}>
          In kid words: Jesus sends his friends out to share the good news with everyone, not to keep it inside the church
          building.
        </p>
        <p className="mt-3 text-sm text-[#6b7280]">
          Scripture quote from the New American Bible, revised edition (NABRE).
        </p>
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
        <p className={body}>
          Official source line: the two main parts are taught in the Catechism of the Catholic Church, paragraph 1346, and in the
          General Instruction of the Roman Missal, paragraph 28. The opening and closing rites are part of the same celebration.
        </p>
      </section>

      <section id="worksheet-card" className="mt-8" aria-labelledby="worksheet-card-title">
        <h2 id="worksheet-card-title" className={h2}>
          Print this worksheet
        </h2>
        <div className="mt-3 max-w-sm">
          <LockedSheetPreview title="Level 1 and Level 2 worksheets for the four parts of the Mass" />
        </div>
        <p className={body}>Level 1 and Level 2 are both included. Preview and printing are part of Plus.</p>
        <p className="mt-3">
          <Link
            href={printPath(getEvergreenPageBySlug("four-parts-of-the-mass")!, 1, true)}
            className="inline-flex rounded-full bg-[#2e7d32] px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#256628]"
          >
            Print this worksheet
          </Link>
        </p>
      </section>

      <section className="mt-8" aria-labelledby="quick-faq">
        <h2 id="quick-faq" className={h2}>
          Quick FAQ
        </h2>
        <h3 className={h3}>What are the 4 parts of the Catholic Mass in order?</h3>
        <p className={body}>
          Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, and Concluding Rites. The Word and the Eucharist are
          the two main central parts, and they form one act of worship.
        </p>
        <h3 className={h3}>Why does the priest mix a drop of water into the wine and wash his hands at Mass?</h3>
        <p className={body}>
          He pours a little water into the wine. We can tell children that Jesus became one of us and shares his life with us.
          He then washes his hands as a prayer that his heart will be clean for the offering.
        </p>
        <h3 className={h3}>What grades are these worksheets for, and can parents or catechists print them for a class?</h3>
        <p className={body}>
          Level 1 suits about Grades K–2, and Level 2 suits about Grades 3–5, including First Communion prep. Parents and
          catechists who have Plus may print them for the children they teach. Preview and printing need Plus.
        </p>
      </section>

      {cards.length ? (
        <section className="mt-8" aria-labelledby="cards">
          <h2 id="cards" className={h2}>
            Related picture cards
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#374151]">
            {cards.map((card) => (
              <li key={card.id}>
                <span className="font-semibold">{card.title}</span>
                {" — "}
                {card.text}
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

      <section className="mt-8" aria-labelledby="sources">
        <h2 id="sources" className="text-sm font-bold uppercase tracking-wide text-[#9a6b3f]">
          Sources checked for this page
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4b5563]">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a href={source.href} className="text-[#335599] hover:underline">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

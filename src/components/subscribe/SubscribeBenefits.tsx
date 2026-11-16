import Image from "next/image";

type Benefit = {
  title: string;
  body: string;
  image: string;
  alt: string;
  imageRight?: boolean;
};

const BENEFITS: Benefit[] = [
  {
    title: "One Plus plan for the whole family",
    body: "Parents and up to five children share the same pass. Each child keeps their own Kid Code, progress, and reading profile.",
    image: "/home-features/bible.webp",
    alt: "Family Bible reading on Catholic Kids Crafts",
  },
  {
    title: "Private memos on every passage",
    body: "Write short notes while typing Scripture. Share with family when you want, print a keepsake PDF, and keep your memos even after a pass ends.",
    image: "/home-features/memos.webp",
    alt: "Bible passage memos",
    imageRight: true,
  },
  {
    title: "Catechism activities and printables",
    body: "Unlock craft templates, worksheets, and catechism activities made for Catholic homes and classrooms—ready to print and make together.",
    image: "/home-features/curriculum.webp",
    alt: "Catholic catechism activities and crafts",
  },
  {
    title: "Typing stickers and Gospel practice",
    body: "Kids earn praise stickers as they type the day’s Gospel and Bible chapters. Gentle practice that builds faith and fluency side by side.",
    image: "/home-features/gospel.webp",
    alt: "Gospel typing with praise stickers",
    imageRight: true,
  },
];

/** Vertical marketing strips below the Plus checkout card on /subscribe. */
export function SubscribeBenefits() {
  return (
    <div className="mt-14 space-y-12 sm:mt-16 sm:space-y-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
          Why families choose Plus
        </h2>
        <p className="mt-2 text-base text-[var(--color-muted)] sm:text-lg">
          A simple one-time pass for memos, activities, and shared family reading—no subscription to cancel.
        </p>
      </div>

      {BENEFITS.map((b) => (
        <section
          key={b.title}
          className="overflow-hidden border border-[var(--color-border)] bg-white"
          aria-labelledby={`benefit-${b.title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <div className="grid items-center gap-0 lg:grid-cols-2">
            <div
              className={`relative aspect-[16/10] bg-[var(--color-cream)] lg:aspect-auto lg:min-h-[280px] ${
                b.imageRight ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <Image
                src={b.image}
                alt={b.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div
              className={`flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 ${
                b.imageRight ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                Plus
              </p>
              <h3
                id={`benefit-${b.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="mt-2 text-xl font-bold text-[var(--color-ink)] sm:text-2xl"
              >
                {b.title}
              </h3>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[var(--color-muted)]">
                {b.body}
              </p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

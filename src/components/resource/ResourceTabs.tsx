import Link from "next/link";

type Tab = "sunday" | "sheets" | "cards" | "custom";

type Props = {
  active: Tab;
  sheetCount: number;
  cardCount: number;
  level: 1 | 2;
};

/** Resource type tabs under the search bar (This Sunday · Weekly Sheet · Cards). */
export function ResourceTabs({ active, sheetCount, cardCount, level }: Props) {
  const lv = level === 2 ? "level=2" : "";
  const withLevel = (base: string) => (lv ? `${base}${base.includes("?") ? "&" : "?"}${lv}` : base);
  const tabs: { id: Tab; href: string; label: React.ReactNode }[] = [
    { id: "sunday", href: withLevel("/resource"), label: <>★ This Sunday</> },
    {
      id: "sheets",
      href: withLevel("/resource?view=all"),
      label: (
        <>
          Weekly Sheet <Count n={sheetCount} on={active === "sheets"} />
        </>
      ),
    },
    {
      id: "cards",
      href: "/resource?view=cards",
      label: (
        <>
          Cards <Count n={cardCount} on={active === "cards"} />
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
        </>
      ),
    },
  ];
  return (
    <nav aria-label="Resource types" className="mt-4 border-b border-[#ece6df]">
      <ul className="m-0 flex list-none flex-wrap gap-x-1 p-0">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <li key={t.id}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#d35400] ${
                  on
                    ? "border-[#d35400] font-semibold text-[#d35400]"
                    : "border-transparent font-medium text-[#4b5563] hover:text-[#1c1c1c]"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Count({ n, on }: { n: number; on: boolean }) {
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${on ? "bg-[#fde7d6] text-[#d35400]" : "bg-[#f1eeea] text-[#6b7280]"}`}
    >
      {n}
    </span>
  );
}

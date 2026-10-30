import Link from "next/link";

type Tab = "sunday" | "sheets" | "cards" | "custom";

type Props = {
  /** null while showing unified search results (they span every type, so no tab is current). */
  active: Tab | null;
  level: 1 | 2;
};

/** Resource type tabs: This Sunday · Weekly Sheet · Cards · Activities (soon) · Crafts (soon). */
export function ResourceTabs({ active, level }: Props) {
  const lv = level === 2 ? "level=2" : "";
  const withLevel = (base: string) => (lv ? `${base}${base.includes("?") ? "&" : "?"}${lv}` : base);
  const tabs: { id: Tab; href: string; label: React.ReactNode }[] = [
    { id: "sunday", href: withLevel("/resource"), label: <>★ This Sunday</> },
    {
      id: "sheets",
      href: withLevel("/resource?view=all"),
label: <>Weekly Sheet</>
    },
    {
      id: "cards",
      href: withLevel("/resource?view=cards"),
label: <>Cards</>
    },
  ];
  const tabCls = (on: boolean) =>
    `-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#d35400] ${
      on ? "border-[#d35400] font-semibold text-[#d35400]" : "border-transparent font-medium text-[#4b5563] hover:text-[#1c1c1c]"
    }`;
  return (
    <nav aria-label="Resource types" className="mt-4 overflow-x-auto border-b border-[#ece6df]">
      <ul className="m-0 flex list-none gap-x-1 p-0">
        {tabs.map((t) => (
          <li key={t.id}>
            <Link href={t.href} aria-current={t.id === active ? "page" : undefined} className={tabCls(t.id === active)}>
              {t.label}
            </Link>
          </li>
        ))}
        {["Activities", "Crafts"].map((label) => (
          <li key={label}>
            <span
              className={`${tabCls(false)} cursor-default text-[#9ca3af] hover:text-[#9ca3af]`}
              aria-disabled="true"
              title={`${label} are coming soon`}
            >
              {label}
              <span className="sr-only"> (coming soon)</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

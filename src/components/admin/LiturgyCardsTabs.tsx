import Link from "next/link";
import { qaListHref } from "@/lib/admin-liturgy-paths";

export function LiturgyCardsTabs({ active }: { active: "weekly" | "qa" }) {
  const tabs = [
    { key: "weekly", label: "Weekly cards", href: "/admin/liturgy-cards" },
    { key: "qa", label: "Q&A cards & Prayers", href: qaListHref() },
  ] as const;
  return (
    <nav className="mt-6 flex gap-1 border-b border-[var(--color-border)]" aria-label="Liturgy card types">
      {tabs.map((tab) => {
        const current = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold ${
              current
                ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

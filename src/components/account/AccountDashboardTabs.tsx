"use client";

import { useId, useState, type ReactNode } from "react";

export type AccountTabId = "account" | "plus" | "notes";

const TABS: { id: AccountTabId; label: string; panelLabel: string }[] = [
  { id: "account", label: "Account", panelLabel: "Account" },
  { id: "plus", label: "Plus", panelLabel: "Plus" },
  { id: "notes", label: "Notes", panelLabel: "Memos and Mom's Bible" },
];

type Props = {
  account: ReactNode;
  plus: ReactNode;
  notes: ReactNode;
};

/** Client tab shell for /account: Account · Plus · Notes. Panels are server-rendered React nodes. */
export function AccountDashboardTabs({ account, plus, notes }: Props) {
  const [tab, setTab] = useState<AccountTabId>("account");
  const baseId = useId();
  const panels: Record<AccountTabId, ReactNode> = { account, plus, notes };

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Family account sections"
        className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              className={`min-h-11 flex-1 rounded-lg px-4 py-2.5 text-base font-bold transition sm:flex-none sm:px-5 ${
                selected
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-transparent text-[var(--color-ink)] hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {TABS.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={tab !== item.id}
          className="mt-6"
        >
          <span className="sr-only">{item.panelLabel}</span>
          {panels[item.id]}
        </div>
      ))}
    </div>
  );
}

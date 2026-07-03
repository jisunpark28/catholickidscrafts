"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ParishData = {
  parish: {
    name: string;
    role: string;
    weekOpens: number;
    kits: { id: string; title: string; shareSlug: string; opens: number }[];
  } | null;
};

export function ParishDashboard() {
  const [data, setData] = useState<ParishData | null>(null);

  useEffect(() => {
    void fetch("/api/program/parish")
      .then((r) => r.json())
      .then((json: ParishData) => setData(json));
  }, []);

  if (!data) return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;
  if (!data.parish) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No parish linked.{" "}
        <Link href="/program/join" className="font-semibold text-[var(--color-link)]">
          Join with code
        </Link>
      </p>
    );
  }

  const { parish } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-ink)]">{parish.name}</h2>
      <p className="text-sm text-[var(--color-muted)]">
        {parish.weekOpens} opens (recent) · {parish.kits.length} lesson kits
      </p>
      <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-white">
        {parish.kits.map((k) => (
          <li key={k.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-[var(--color-ink)]">{k.title}</span>
            <span className="text-sm text-[var(--color-muted)]">{k.opens} opens</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

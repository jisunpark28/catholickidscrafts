import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PrayersReader } from "@/components/prayers/PrayersReader";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/prayers.css";

export const metadata: Metadata = {
  title: "Catholic Prayers",
  description:
    "Essential Catholic prayers for children and catechists: Our Father, Hail Mary, creeds, meal prayers, and more.",
  ...canonicalForPath("/prayers"),
};

export default function PrayersPage() {
  return (
    <PageShell wide>
      <PageHeader title="Prayers" />
      <Suspense
        fallback={
          <p className="text-sm text-[var(--color-muted)]">Loading prayers…</p>
        }
      >
        <PrayersReader />
      </Suspense>
    </PageShell>
  );
}

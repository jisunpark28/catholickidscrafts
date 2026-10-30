import { HomePdfShell } from "@/components/home/HomePdfShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getResourceNav } from "@/lib/resource/nav";
import {
  RESOURCE_SEASONS,
  searchSheets,
  seasonPath,
  seasonSeoTitle,
} from "@/lib/resource/sheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import { PLAN_FEATURES, PLAN_OPTIONS } from "@/lib/subscription/plan-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Printables for Catholic Families and Catechists",
  description:
    "Free printable Sunday Gospel worksheets by liturgical season — Advent, Christmas, Lent, Easter, Ordinary Time and feasts — with Level 1 and Level 2 for Catholic kids and catechists.",
  path: "/resources",
});

export const dynamic = "force-dynamic";

/** Season hubs + Plus printables overview for programmatic SEO discovery. */
export default async function ResourcesPage() {
  const nav = await getResourceNav();
  const seasonCounts = RESOURCE_SEASONS.map((s) => ({
    ...s,
    count: searchSheets({ season: s.id }).length,
  }));

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <JsonLd nodes={[breadcrumbNode([{ name: "Printables", path: "/resources" }])]} />
      <h1 className="text-3xl font-bold text-[#1c1c1c]">Printables</h1>
      <p className="mt-2 max-w-2xl text-[#6b7280]">
        The weekly{" "}
        <Link href="/resource" className="font-semibold text-[#335599] hover:underline">
          Sunday Sheet
        </Link>{" "}
        is free for everyone. Browse Gospel worksheets by liturgical season below — full Level 1 and
        Level 2 text is open to read; Print and Edit unlock with Plus.
      </p>

      <nav aria-label="Liturgical seasons" className="mt-6 flex flex-wrap gap-2">
        {seasonCounts.map((s) => (
          <Link
            key={s.id}
            href={seasonPath(s.id)}
            className="rounded-full border border-[#e7e3de] bg-white px-3 py-1.5 text-sm font-semibold text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
          >
            {s.label}
            <span className="ml-1.5 font-normal text-[#6b7280]">{s.count}</span>
          </Link>
        ))}
      </nav>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-[#1c1c1c]">Gospel worksheets by season</h2>
        <ul className="mt-3 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {seasonCounts.map((s) => (
            <li key={s.id}>
              <Link
                href={seasonPath(s.id)}
                className="block rounded-2xl border border-[#efe6da] bg-white p-5 no-underline hover:border-[#d35400]"
              >
                <span className="text-lg font-bold text-[#1c1c1c]">{s.label}</span>
                <span className="mt-1 block text-sm text-[#6b7280]">
                  {seasonSeoTitle(s.id)} · {s.count} sheets
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 max-w-3xl rounded-2xl border border-[#efe6da] bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[#1c1c1c]">What Plus includes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {PLAN_FEATURES.map((f) => (
            <li key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-[#1c1c1c]">{f.label}</span>
              <span className={`text-xs font-semibold ${f.plus ? "text-[#d35400]" : "text-green-800"}`}>
                {f.plus ? "Plus" : "Free"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-6">
          {(["month", "year"] as const).map((k) => (
            <p key={k} className="text-2xl font-bold text-[#1c1c1c]">
              {PLAN_OPTIONS[k].price}
              <span className="text-sm font-normal text-[#6b7280]">
                {PLAN_OPTIONS[k].unit}, {PLAN_OPTIONS[k].billed}
              </span>
            </p>
          ))}
        </div>
        <Link
          href="/subscribe"
          className="mt-4 inline-block rounded-full bg-[#d35400] px-6 py-2.5 font-bold text-white no-underline"
        >
          Get Plus
        </Link>
        <p className="mt-3 text-xs text-[#6b7280]">One-time payment. No auto-renew. Secure checkout with Stripe.</p>
      </section>
    </HomePdfShell>
  );
}

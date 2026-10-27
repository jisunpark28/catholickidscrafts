import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SheetFabricEditorLazy } from "@/components/resource/SheetFabricEditorLazy";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import {
  sheetBasePublicPaths,
  sheetBaseRev,
  sheetLayoutSchema,
} from "@/lib/resource/sheet-base";
import { resourcePath, slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import { familyHasPlus } from "@/lib/subscription/entitlements";
import { requireParentActive } from "@/lib/family-auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Edit Sunday sheet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadLayout(key: string, level: 1 | 2) {
  const { fsLayout } = sheetBasePublicPaths(key, level);
  try {
    const raw = await readFile(path.join(process.cwd(), fsLayout), "utf8");
    return sheetLayoutSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Plus Fabric editor (Phase 3): locked base PNG + editable text/stickers + save diff. */
export default async function ResourceEditPage({ params, searchParams }: Props) {
  const [{ slug }, sp, nav, session] = await Promise.all([
    params,
    searchParams,
    getResourceNav(),
    requireParentActive(),
  ]);
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  const level = parseLevelParam(sp.level);
  const isPlus = session ? await familyHasPlus(session.familyAccountId) : false;
  const layout = await loadLayout(key, level);
  const paths = sheetBasePublicPaths(key, level);
  const rev = sheetBaseRev(sheet, level);
  const customId = typeof one(sp.id) === "string" ? one(sp.id) : null;

  return (
    <HomePdfShell groups={nav.groups} dailyMassLabel={nav.dailyMassLabel}>
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/resource" className="text-[#335599]">
          Resource
        </Link>{" "}
        ›{" "}
        <Link href={resourcePath(key, level)} className="text-[#335599]">
          {sheet.liturgicalName}
        </Link>{" "}
        › Edit
      </nav>

      <div className="mb-4 mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold text-[#1c1c1c]">
            Edit · {level === 2 ? sheet.levels.level2.title : sheet.levels.level1.title}
          </h1>
          <p className="mb-0 mt-1 text-sm text-[#6b7280]">
            {key} · {yearLabel(key)} · Level {level}
            {layout ? ` · base rev ${layout.rev}` : null}
            {layout && layout.rev !== rev ? " · ⚠ sheet content changed — regenerate base" : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={resourcePath(key, level)}
            className="rounded-full border border-[#e7e3de] bg-white px-4 py-2 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
          >
            Back to sheet
          </Link>
          {!isPlus ? (
            <Link
              href="/subscribe"
              className="rounded-full border border-[#d35400] bg-[#d35400] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
            >
              Unlock with Plus
            </Link>
          ) : null}
        </div>
      </div>

      {!layout ? (
        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
          Base assets for this sheet are not generated yet:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#1c1c1c] p-3 text-xs text-[#f5ebe0]">
            npx tsx scripts/generate-sheet-bases.ts --key {key} --levels {level}
          </pre>
        </div>
      ) : (
        <SheetFabricEditorLazy
          sheet={sheet}
          level={level}
          layout={layout}
          basePngUrl={paths.png}
          baseRev={rev}
          isPlus={Boolean(isPlus)}
          initialCustomId={customId}
        />
      )}
    </HomePdfShell>
  );
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

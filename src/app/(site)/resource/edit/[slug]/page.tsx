import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SheetFabricLiveBase } from "@/components/resource/SheetFabricLiveBase";
import { parseLevelParam } from "@/lib/gospel-sheet-level";
import { getResourceNav } from "@/lib/resource/nav";
import { sheetOpenAllowed, resolveResourceViewer } from "@/lib/resource/resolve-access";
import {
  sheetBasePublicPaths,
  sheetBaseRev,
  sheetLayoutSchema,
} from "@/lib/resource/sheet-base";
import { resourcePath, slugToKey, yearLabel } from "@/lib/resource/sheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
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

async function hasPng(key: string, level: 1 | 2) {
  const { fsPng } = sheetBasePublicPaths(key, level);
  try {
    await readFile(path.join(process.cwd(), fsPng));
    return true;
  } catch {
    return false;
  }
}

/** Plus Fabric editor: static base when present, otherwise live browser capture. */
export default async function ResourceEditPage({ params, searchParams }: Props) {
  const [{ slug }, sp, nav, viewer] = await Promise.all([
    params,
    searchParams,
    getResourceNav(),
    resolveResourceViewer(),
  ]);
  const key = slugToKey(slug);
  const sheet = key ? getSundaySheet(key) : null;
  if (!key || !sheet) notFound();
  const level = parseLevelParam(sp.level);
  const allowed = sheetOpenAllowed(viewer, key);
  const layout = await loadLayout(key, level);
  const pngOk = layout ? await hasPng(key, level) : false;
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
            {layout ? ` · base rev ${layout.rev}` : " · live base"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={resourcePath(key, level)}
            className="rounded-full border border-[#e7e3de] bg-white px-4 py-2 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
          >
            Back to sheet
          </Link>
          {!viewer.isPlus ? (
            <Link
              href="/subscribe"
              className="rounded-full border border-[#d35400] bg-[#d35400] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
            >
              Unlock with Plus
            </Link>
          ) : null}
        </div>
      </div>

      {!allowed ? (
        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-6 text-sm text-[#4b5563]">
          Free accounts can only open this Sunday&apos;s sheet.{" "}
          <Link href="/subscribe" className="font-semibold text-[#d35400]">
            Plus
          </Link>{" "}
          unlocks the full library and the editor.
          {viewer.thisSundayKey ? (
            <>
              {" "}
              <Link href={resourcePath(viewer.thisSundayKey, level)} className="text-[#335599]">
                Go to this Sunday
              </Link>
            </>
          ) : null}
        </div>
      ) : (
        <SheetFabricLiveBase
          sheet={sheet}
          level={level}
          layout={layout}
          basePngUrl={pngOk ? paths.png : null}
          baseRev={rev}
          isPlus={viewer.isPlus}
          initialCustomId={customId}
        />
      )}
    </HomePdfShell>
  );
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

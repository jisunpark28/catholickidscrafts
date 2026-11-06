/** Server data for Mom's Bible on reader / book / situations pages. */
import { cookies } from "next/headers";
import { SAMPLE_BOOK, SAMPLE_CHAPTER, sampleGenesisView } from "@/data/moms-bible/sample-genesis-1";
import { childHasFamilyPass, resolveFamilyPlus } from "@/lib/subscription/entitlements";
import { getMbViewer, linkedParents, type MbLinkedChild, type MbViewer } from "./access";
import { MB_CHILD_COOKIE } from "./constants";
import { childNewNote, childSeedCount, loadAllBookStamps, loadChapterView, parentUnseenReplies } from "./queries";
import type { MbChapterView, MbToolbarData } from "./types";

export type ChildBanner = Awaited<ReturnType<typeof childNewNote>>;
export type ParentBanner = Awaited<ReturnType<typeof parentUnseenReplies>>;

/** ?child= wins, then the remembered choice (cookie), then the first child. Always a linked child. */
async function pickChild(children: MbLinkedChild[], childParam?: string | null): Promise<MbLinkedChild | null> {
  if (children.length === 0) return null;
  const jar = await cookies();
  const remembered = jar.get(MB_CHILD_COOKIE)?.value;
  return children.find((c) => c.id === childParam) ?? children.find((c) => c.id === remembered) ?? children[0]!;
}

async function toolbarFor(
  viewer: MbViewer,
  child: MbLinkedChild | null,
  /** When the chapter view already loaded seeds, reuse it (avoids a second count query). */
  seedsHint?: number,
): Promise<MbToolbarData | null> {
  if (viewer.kind === "child") {
    return {
      viewer: "child",
      childName: viewer.displayName,
      kidCode: viewer.kidCode,
      seeds: seedsHint ?? (await childSeedCount(viewer.childId)),
    };
  }
  if (!child) return null;
  return {
    viewer: "parent",
    childId: child.id,
    childName: child.displayName,
    children: viewer.children.map((c) => ({ id: c.id, displayName: c.displayName })),
    canPrint: (await resolveFamilyPlus(viewer.parentId)).isPlus,
  };
}

const isSamplePage = (bookSlug: string, chapters: number[]) => bookSlug === SAMPLE_BOOK && chapters.includes(SAMPLE_CHAPTER);

export async function readerPageMomsBible(args: {
  bookSlug: string;
  chapters: number[];
  childParam?: string | null;
}): Promise<{
  view: MbChapterView | null;
  intro: "guest" | "no-child" | null;
  childBanner: ChildBanner;
  parentBanner: ParentBanner | null;
  toolbar: MbToolbarData | null;
}> {
  const sample = isSamplePage(args.bookSlug, args.chapters);
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) {
    return { view: sample ? sampleGenesisView() : null, intro: "guest", childBanner: null, parentBanner: null, toolbar: null };
  }
  if (viewer.kind === "child") {
    const [view, banner] = await Promise.all([
      loadChapterView({
        viewer: { kind: "child", childId: viewer.childId },
        childId: viewer.childId,
        bookSlug: args.bookSlug,
        chapters: args.chapters,
        familyPass: await childHasFamilyPass(viewer.childId),
      }),
      childNewNote(viewer.childId),
    ]);
    const toolbar = await toolbarFor(viewer, null, view.seeds);
    const elsewhere = banner && !(banner.bookSlug === args.bookSlug && args.chapters.includes(banner.chapter));
    return { view, intro: null, childBanner: elsewhere ? banner : null, parentBanner: null, toolbar };
  }
  const parentBanner = await parentUnseenReplies(viewer.parentId);
  const child = await pickChild(viewer.children, args.childParam);
  if (!child) {
    return { view: sample ? sampleGenesisView() : null, intro: "no-child", childBanner: null, parentBanner, toolbar: null };
  }
  const [view, toolbar] = await Promise.all([
    loadChapterView({
      viewer: {
        kind: "parent",
        parentId: viewer.parentId,
        children: viewer.children.map((c) => ({ id: c.id, displayName: c.displayName })),
      },
      childId: child.id,
      bookSlug: args.bookSlug,
      chapters: args.chapters,
      familyPass: await childHasFamilyPass(child.id),
    }),
    toolbarFor(viewer, child),
  ]);
  // Free preview: a parent without Plus sees the sample on Genesis 1 (unless they already wrote there).
  const showSample = sample && !view.familyPass && view.notes.length === 0 && view.highlights.length === 0;
  const l = parentBanner.latest;
  const here = l && l.childId === child.id && l.bookSlug === args.bookSlug && args.chapters.includes(l.chapter);
  return {
    view: showSample ? sampleGenesisView() : view,
    intro: null,
    childBanner: null,
    parentBanner: here ? null : parentBanner,
    toolbar,
  };
}

/** Book index: stamps for the viewer's (selected) child, or null for everyone else. */
export async function bookPageMomsBible(bookSlug: string): Promise<{
  stamps: Record<number, "mine" | "waiting" | "shared">;
  stampsByBook: Record<string, Record<number, "mine" | "waiting" | "shared">>;
  childName: string;
  viewer: "parent" | "child";
  roleLabels: string[];
  childBanner: ChildBanner;
  toolbar: MbToolbarData | null;
} | null> {
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) return null;
  if (viewer.kind === "child") {
    const [stampsByBook, banner, parents, toolbar] = await Promise.all([
      loadAllBookStamps(viewer.childId, { kind: "child" }),
      childNewNote(viewer.childId),
      linkedParents(viewer.childId),
      toolbarFor(viewer, null),
    ]);
    return {
      stamps: stampsByBook[bookSlug] ?? {},
      stampsByBook,
      childName: viewer.displayName,
      viewer: "child",
      roleLabels: [...new Set(parents.map((p) => p.roleLabel))],
      childBanner: banner,
      toolbar,
    };
  }
  const child = await pickChild(viewer.children);
  if (!child) return null;
  const [stampsByBook, toolbar] = await Promise.all([
    loadAllBookStamps(child.id, { kind: "parent", parentId: viewer.parentId }),
    toolbarFor(viewer, child),
  ]);
  return {
    stamps: stampsByBook[bookSlug] ?? {},
    stampsByBook,
    childName: child.displayName,
    viewer: "parent",
    roleLabels: [child.roleLabel],
    childBanner: null,
    toolbar,
  };
}

/** Toolbar only (situations page). */
export async function momsBibleToolbar(): Promise<MbToolbarData | null> {
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) return null;
  if (viewer.kind === "child") return toolbarFor(viewer, null);
  return toolbarFor(viewer, await pickChild(viewer.children));
}

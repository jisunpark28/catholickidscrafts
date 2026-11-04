/** Server data for Mom's Bible on reader / book pages. */
import { cookies } from "next/headers";
import { childHasFamilyPass } from "@/lib/subscription/entitlements";
import { getMbViewer, linkedParents, type MbLinkedChild } from "./access";
import { MB_CHILD_COOKIE } from "./constants";
import { childNewNote, loadBookStamps, loadChapterView, parentUnseenReplies } from "./queries";
import type { MbChapterView } from "./types";

export type ChildBanner = Awaited<ReturnType<typeof childNewNote>>;
export type ParentBanner = Awaited<ReturnType<typeof parentUnseenReplies>>;

/** ?child= wins, then the remembered choice (cookie), then the first child. Always a linked child. */
async function pickChild(children: MbLinkedChild[], childParam?: string | null): Promise<MbLinkedChild | null> {
  if (children.length === 0) return null;
  const jar = await cookies();
  const remembered = jar.get(MB_CHILD_COOKIE)?.value;
  return (
    children.find((c) => c.id === childParam) ?? children.find((c) => c.id === remembered) ?? children[0]!
  );
}

export async function readerPageMomsBible(args: {
  bookSlug: string;
  chapters: number[];
  childParam?: string | null;
}): Promise<{
  view: MbChapterView | null;
  intro: "guest" | "no-child" | null;
  childBanner: ChildBanner;
  parentBanner: ParentBanner | null;
}> {
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) return { view: null, intro: "guest", childBanner: null, parentBanner: null };
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
    const elsewhere = banner && !(banner.bookSlug === args.bookSlug && args.chapters.includes(banner.chapter));
    return { view, intro: null, childBanner: elsewhere ? banner : null, parentBanner: null };
  }
  const parentBanner = await parentUnseenReplies(viewer.parentId);
  const child = await pickChild(viewer.children, args.childParam);
  if (!child) return { view: null, intro: "no-child", childBanner: null, parentBanner };
  const view = await loadChapterView({
    viewer: {
      kind: "parent",
      parentId: viewer.parentId,
      children: viewer.children.map((c) => ({ id: c.id, displayName: c.displayName })),
    },
    childId: child.id,
    bookSlug: args.bookSlug,
    chapters: args.chapters,
    familyPass: await childHasFamilyPass(child.id),
  });
  const l = parentBanner.latest;
  const here = l && l.childId === child.id && l.bookSlug === args.bookSlug && args.chapters.includes(l.chapter);
  return { view, intro: null, childBanner: null, parentBanner: here ? null : parentBanner };
}

/** Book index: stamps for the viewer's (selected) child, or null for everyone else. */
export async function bookPageMomsBible(bookSlug: string): Promise<{
  stamps: Record<number, "waiting" | "shared" | "highlights">;
  childName: string;
  viewer: "parent" | "child";
  roleLabels: string[];
  childBanner: ChildBanner;
} | null> {
  const viewer = await getMbViewer().catch(() => null);
  if (!viewer) return null;
  if (viewer.kind === "child") {
    const [stamps, banner, parents] = await Promise.all([
      loadBookStamps(viewer.childId, bookSlug),
      childNewNote(viewer.childId),
      linkedParents(viewer.childId),
    ]);
    return {
      stamps,
      childName: viewer.displayName,
      viewer: "child",
      roleLabels: [...new Set(parents.map((p) => p.roleLabel))],
      childBanner: banner,
    };
  }
  const child = await pickChild(viewer.children);
  if (!child) return null;
  return {
    stamps: await loadBookStamps(child.id, bookSlug),
    childName: child.displayName,
    viewer: "parent",
    roleLabels: [child.roleLabel],
    childBanner: null,
  };
}

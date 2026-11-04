/**
 * Free preview (design PR-4): a static sample of Mom's Bible on Genesis 1 for guests and parents
 * without Plus. Nothing here is stored; every write action opens the Plus modal instead.
 */
import type { MbChapterView } from "@/lib/moms-bible/types";

export const SAMPLE_BOOK = "genesis";
export const SAMPLE_CHAPTER = 1;
const MOM = "sample-mom";

export function sampleGenesisView(): MbChapterView {
  return {
    viewer: "parent",
    preview: true,
    childId: "sample-child",
    childName: "Mia",
    children: [{ id: "sample-child", displayName: "Mia" }],
    siblings: [],
    authors: [{ parentId: MOM, roleLabel: "Mom", isMe: true }],
    familyPass: true,
    seeds: 0,
    highlights: [
      { id: "sample-h1", authorParentId: MOM, chapter: 1, verse: 1, color: "YELLOW", star: false, underline: false },
      { id: "sample-h27", authorParentId: MOM, chapter: 1, verse: 27, color: "PINK", star: false, underline: false },
      { id: "sample-h31", authorParentId: MOM, chapter: 1, verse: 31, color: "GREEN", star: true, underline: false },
    ],
    notes: [
      {
        id: "sample-letter",
        authorParentId: MOM,
        chapter: 1,
        startVerse: null,
        endVerse: null,
        ref: "Genesis 1",
        color: null,
        situationKey: null,
        childRepliedAt: null,
        createdAt: "2026-11-02T15:00:00.000Z",
        unseenReply: false,
        items: [
          {
            id: "sample-letter-1",
            authorKind: "PARENT",
            authorParentId: MOM,
            kind: "TEXT",
            body: "Mia, God made the whole world with love, and then He made you. Every time you read this, remember how wanted you are. Love, Mom",
            stickerKey: null,
            createdAt: "2026-11-02T15:00:00.000Z",
            mine: true,
          },
        ],
      },
      {
        id: "sample-v27",
        authorParentId: MOM,
        chapter: 1,
        startVerse: 27,
        endVerse: 27,
        ref: "Genesis 1:27",
        color: "PINK",
        situationKey: "just-because",
        childRepliedAt: "2026-11-04T00:42:00.000Z",
        createdAt: "2026-11-03T14:00:00.000Z",
        unseenReply: false,
        items: [
          {
            id: "sample-v27-1",
            authorKind: "PARENT",
            authorParentId: MOM,
            kind: "TEXT",
            body: "You are made in God's own image. Nobody else in the world is quite like you. 💛",
            stickerKey: null,
            createdAt: "2026-11-03T14:00:00.000Z",
            mine: true,
          },
          {
            id: "sample-v27-2",
            authorKind: "CHILD",
            authorParentId: null,
            kind: "STICKER",
            body: null,
            stickerKey: "love",
            createdAt: "2026-11-04T00:42:00.000Z",
            mine: false,
          },
          {
            id: "sample-v27-3",
            authorKind: "CHILD",
            authorParentId: null,
            kind: "TEXT",
            body: "Thank you Mom. I like being me!",
            stickerKey: null,
            createdAt: "2026-11-04T00:42:01.000Z",
            mine: false,
          },
        ],
      },
    ],
  };
}

/** The sample shown in the notes column on other chapters (guests). */
export const SAMPLE_NOTE_TEXT = "Sweetheart, God is near you when you're sad. I'm praying for you!";

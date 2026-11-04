# Mom's Bible: design (draft v1, 2026-11-04)

Status: design for review. Step 2 (official numbering on the reader, typing removed from the
Old/New Testament pages, empty "Mom's Notes" column) is on branch `feat/moms-bible-step2`.
Nothing below is built yet. No migration in this document has been run anywhere.

Scope: only the Old/New Testament reader (`/bible/read/[book]/[chapter]`, `/bible/[book]`).
**Today's Gospel typing (`/bible/gospel`, Universalis, `GospelTypingSection`,
`PassageTypingGame`, `GospelDayProgress`, faith journal) does not change.**

---

## 1. What exists today (prisma/schema.prisma)

| Concept need | Already in the code | Gap |
|---|---|---|
| Parent account | `FamilyAccount` (email/Google, `sessionVersion` for "sign out everywhere") | One login per family. No second parent. |
| Child | `SubProfile` (displayName, Access ID `CKC-XXXX-XXXX` bcrypt hash + sha256 lookup, `active`, max 5 per family) | No PIN. Child belongs to exactly one `FamilyAccount`. |
| Child sign-in | `/api/auth/reader/login` (Access ID), `AuthRateLimit` per IP (`READER_LOGIN_RULE` 10 fails / 15 min -> 15 min block), device lock / child mode (`effectiveReaderMode`) | No per-child counter, no escalation, no parent alert. |
| Plus | `PlusPass` (one-time, `expiresAt`, `revokedAt`), legacy `Subscription`, `PAID_PREVIEW_EMAILS`; `hasPaidFeatures(readerKey)` resolves a child to its family | Only the one family. |
| Memos / highlights | `BiblePassageMemo` (author = family owner or child, Douay `bookSlug`/`chapter`, verse range + char offsets, 5 colours, PRIVATE/FAMILY) | Memos are "my notes", not parent -> child messages; no threads, stickers, stamps. |
| Progress stickers | `BibleChapterProgress` (typing >= 80%) | Typing is gone from OT/NT pages in step 2, so no new ✝ stickers there (see open question 11). |
| Discussion | `BibleChapterThread` / `BibleChapterComment` (public, per Douay chapter) | Unrelated, but visible to kid sessions today. |

Storage keys stay **Douay-Rheims** (`bookSlug` = latinprayer slug, `chapter`/`verse` = Douay).
Display and all new editorial content (situations, weekly verse) use **NABRE** references and
convert with `src/lib/bible/ref-map.ts` / `src/lib/bible/chapter-pages.ts`.

---

## 2. Prisma models (draft)

Additive only: no existing column changes meaning, no table is dropped.

```prisma
enum MbColor        { YELLOW GREEN BLUE PINK }        // 💛 comfort · 💚 wisdom · 🔵 courage · 🩷 blessing
enum MbAuthorKind   { PARENT CHILD }
enum MbItemKind     { TEXT STICKER }

/// Parent <-> child link (N:M). The SubProfile's own familyAccountId stays the "owner" parent.
model ParentChildLink {
  id              String        @id @default(cuid())
  parentAccountId String        // FamilyAccount of Mom / Dad / Grandma
  subProfileId    String
  roleLabel       String        // "Mom" | "Dad" | custom, <= 20 chars, shown on notes
  isOwner         Boolean       @default(false)   // true for SubProfile.familyAccountId
  createdAt       DateTime      @default(now())
  parent          FamilyAccount @relation(fields: [parentAccountId], references: [id], onDelete: Cascade)
  child           SubProfile    @relation(fields: [subProfileId], references: [id], onDelete: Cascade)
  @@unique([parentAccountId, subProfileId])
  @@index([subProfileId])
}

/// Co-parent invite (Phase 3). Only the token hash is stored.
model ParentInvite {
  id              String    @id @default(cuid())
  ownerAccountId  String
  subProfileIds   String[]  // children the invitee will see
  roleLabel       String
  tokenHash       String    @unique
  expiresAt       DateTime  // 7 days
  acceptedAt      DateTime?
  acceptedById    String?
  createdAt       DateTime  @default(now())
  @@index([ownerAccountId])
}

/// One verse mark by one parent in one child's Bible.
model MbHighlight {
  id              String   @id @default(cuid())
  subProfileId    String   // whose Bible
  authorParentId  String   // FamilyAccount
  bookSlug        String   // Douay
  chapter         Int      // Douay
  verse           Int      // Douay
  color           MbColor?
  star            Boolean  @default(false)
  underline       Boolean  @default(false)
  batchId         String?  // same id on sibling copies ("Also send to Leo")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([subProfileId, authorParentId, bookSlug, chapter, verse])
  @@index([subProfileId, bookSlug, chapter])
  @@index([batchId])
}

/// Chapter letter (startVerse null) or verse card (startVerse..endVerse).
model MbNote {
  id              String    @id @default(cuid())
  subProfileId    String
  authorParentId  String
  bookSlug        String
  chapter         Int
  startVerse      Int?      // null = chapter letter (one per child x parent x chapter, partial unique index in SQL)
  endVerse        Int?
  color           MbColor?
  situationKey    String?   // e.g. "losing-a-pet" when created from the situation picker
  batchId         String?
  lastActivityAt  DateTime  @default(now())   // newest item, for "new note" banner + stamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  items           MbNoteItem[]
  @@index([subProfileId, bookSlug, chapter])
  @@index([subProfileId, lastActivityAt])
  @@index([batchId])
}

/// Thread entry under a note: parent text, child reply, or 1-click sticker.
model MbNoteItem {
  id             String       @id @default(cuid())
  noteId         String
  authorKind     MbAuthorKind
  authorParentId String?      // set when PARENT
  authorChildId  String?      // set when CHILD (must equal note.subProfileId)
  kind           MbItemKind
  body           String?      @db.Text   // TEXT: parent <= 2000, child <= 300 chars
  stickerKey     String?                 // STICKER: whitelisted key ("love-you", "praying", "amen", ...)
  createdAt      DateTime     @default(now())
  editedAt       DateTime?
  deletedAt      DateTime?    // soft delete so a thread keeps its shape
  note           MbNote       @relation(fields: [noteId], references: [id], onDelete: Cascade)
  @@index([noteId, createdAt])
}

/// When the child last opened a chapter (drives "seen" stamp and the new-note banner).
model MbChapterSeen {
  subProfileId String
  bookSlug     String
  chapter      Int
  seenAt       DateTime
  @@id([subProfileId, bookSlug, chapter])
}
```

`SubProfile` additions (kid PIN login, Phase 1):

```prisma
  kidCode         String?   @unique  // 6 chars, random, no 0/O/1/I; shown to the parent
  pinHash         String?            // bcrypt(cost 10) of kidCode + ":" + PIN
  pinSetAt        DateTime?
  pinFailCount    Int       @default(0)
  pinLockedUntil  DateTime?
  pinLockLevel    Int       @default(0)   // escalation step
  pinDisabledAt   DateTime?               // after too many failures; parent must reset
```

Stamps are **computed**, not stored (per child x parent x chapter), from the tables above:
1. 💌 parent wrote something (letter, card or highlight),
2. 👀 child has seen it (`MbChapterSeen.seenAt >= note.lastActivityAt`),
3. 🌱 Shared Together (child replied or sent a sticker).
A cache table is a Phase 3 option only if the table-of-contents query gets slow (it will not
at current family counts: one indexed query per book page).

Relations to add on `FamilyAccount` (`childLinks`, `mbHighlights`, `mbNotes`) and `SubProfile`
(`parentLinks`, ...). Migration SQL (Phase 1) also back-fills one `ParentChildLink` row per
existing `SubProfile` with `isOwner = true`, `roleLabel = 'Parent'` (parent can rename to
Mom/Dad). The migration file is written for review only; Jisun runs it.

### Existing memos

`BiblePassageMemo` stays exactly as it is (it is the "My memos" feature, used by /account/memos,
the print page and today's Gospel faith journal). No data is moved. In the parent view of
Mom's Bible a toggle can show "my own memos" on the same chapter, and a memo card gets
"💌 Send to Mia", which **copies** it into an `MbNote` (verse range carried over, both are
Douay-keyed). Nothing is deleted or rewritten.

---

## 3. API routes and auth rules

Common rules for every route below:
- Identity comes only from the signed session (`getReaderKey()`), never from the body.
  `childId` in a URL/body is only a selector and is always checked against `ParentChildLink`
  (parent) or must equal the session's own `subProfileId` (child).
- Writes check `Origin` = site host (same pattern as `/api/admin/site-copy`) and JSON size.
- Plus: writes by a parent need Plus (see 5). Reads never need Plus for already-saved content.
- Admin sessions get no access to family content (admin != parent).
- Responses never include other families' data, email addresses or PIN state beyond "set / locked".

| Route | Who | Notes |
|---|---|---|
| `GET /api/moms-bible/chapter?child=&book=&chapter=` | linked parent, or the child itself | highlights + notes + items for the Douay chapter(s) of one page |
| `PUT /api/moms-bible/highlights` | linked parent, Plus | upsert/clear one verse mark; `alsoTo: childId[]` -> same batchId |
| `POST /api/moms-bible/notes` | linked parent, Plus | letter or verse card + first item; `alsoTo` deep-copies |
| `PATCH/DELETE /api/moms-bible/notes/[id]` | author parent, Plus | edit/delete own note only |
| `POST /api/moms-bible/notes/[id]/items` | author/linked parent (Plus) or the child of that note | child: sticker or short text; per-child rate limit 30/10 min |
| `PATCH/DELETE /api/moms-bible/items/[id]` | item author | soft delete |
| `POST /api/moms-bible/seen` | child | marks chapter seen |
| `GET /api/moms-bible/stamps?child=&book=` | linked parent or child | table-of-contents stamps for one book |
| `GET /api/moms-bible/inbox?child=` | child | newest unseen note for the banner (Open ->) |
| `POST /api/auth/kid/login` | anyone | kidCode + PIN; limits in 6 |
| `POST /api/account/children/[id]/pin` | owner/linked parent, fresh parent session | set/reset PIN, rotate kidCode, re-enable |
| `POST /api/account/co-parent/invite`, `POST .../accept`, `DELETE .../links/[id]` | owner parent / invitee | Phase 3 |

---

## 4. Pages and components

- `/bible/read/[book]/[chapter]` (step 2 done): right column `MomsNotesPlaceholder` becomes
  `MomsNotesPanel`.
  - Parent: `ChildSwitcher` ("Viewing Mia's Bible ▼ | Leo"), `VersePalette` (tap a verse
    number: 4 colours + ⭐ + underline), `ChapterLetterCard`, `VerseNoteCard` with
    `NoteThread`, `PrayerChips`, `AlsoSendToCheckbox` (left of "Save note 💌"),
    `MomDadTabs` (only when the child has more than one linked parent).
  - Child: `NewNoteBanner` with [Open ->] (scrolls to `#v-34-19`), read-only highlights,
    `NoteThread` bubbles + `StickerBar`, reply box below the thread.
- `/bible/[book]`: `StampToc` replaces the ✝ grid in Mom's Bible mode (3 stamps per chapter,
  official numbering from `chapterGrid()`), toggle "✨ Show Mom's highlights only" filters to
  stamped chapters (filter, not just dimming).
- `/bible/moms/situations`: `SituationPicker` (4 colour groups, 15 situations). Choosing one opens
  the verse page with the colour preselected and prayer chips filled.
- `WeeklyVerseBanner` on the Bible hub and the child's home.
- `FreePreview`: on Genesis 1 (and in the Plus modal) static sample highlights/notes from
  `src/data/moms-bible/sample-genesis-1.ts`; no DB rows.
- `/print/moms-bible/[childId]`: server page, parent only, `@media print` layout (cover with the
  child's first name, then each chapter with notes: verse text, highlights, letters, threads).
  "📖 Print Mia's Bible PDF" button in the header and the table of contents.
- `/account` children section: Kid Code + PIN setup/reset, linked parents list.

Static data: `src/data/moms-bible/situations.ts` (NABRE refs, converted at runtime):

| Group | Situation | NABRE refs (corrected) |
|---|---|---|
| 💛 Comfort | Losing a pet | Ps 34:19 (Douay 33:19), Mt 5:4 (Douay 5:5) |
| | Feeling sad / failed | Is 41:10, Ps 147:3 (Douay 146:3) |
| | Lonely / no friends | Dt 31:6, Jn 15:15 |
| | Bullying and hurt | Ps 34:18-19 (Douay 33:18-19), Is 41:13 |
| 💚 Wisdom | Telling a lie / honesty | Eph 4:25, Prv 12:22 |
| | Anger and fighting | Jas 1:19, Eph 4:32 |
| | Sharing and kindness | Heb 13:16, Lk 6:31 |
| | Screen time and comparison | Rom 12:2, Prv 4:23 |
| 🔵 Courage | Moving / new school | Jos 1:9, Ps 23:1-4 (Douay 22:1-4) |
| | Nightmares and fear | Ps 4:9, Phil 4:6-7 |
| | Before a test / big day | Phil 4:13, Prv 3:5-6 |
| | Anxiety about tomorrow | Mt 6:34, 1 Pt 5:7 |
| 🩷 Blessing | Birthday / First Communion | Nm 6:24-26, Jer 29:11 |
| | Just because I love you | Zep 3:17, 1 Cor 13:4-7 |
| | Blessing your dreams | Mt 5:16, Eph 2:10 |

All 30 refs were checked with `nabreToDouay` (all exact). English text comes from the site's
Douay-Rheims data; no Korean (CBCK) quotations are stored.

---

## 5. Plus for families

- A child "has Plus" when **any** linked parent has Plus; the effective expiry is the latest
  `PlusPass.expiresAt` among them (`resolveFamilyPlus` per linked parent, max 3-4 queries).
- Compute on the server per request (it already is for parents). If we cache it in the kid
  session, store `plusUntil` in the signed token but still re-check on every write so a refund
  (`revokedAt`) takes effect immediately.
- After expiry: everything saved stays readable for parent and child (read-only). New
  highlights, notes and edits return the existing `plusRequiredResponse()`; the panel shows
  the Plus modal. Child stickers: see open question 4.

---

## 6. Security notes

- **Kid sessions are isolated**: a kid token resolves to `{ type: "sub" }` only; every
  Mom's Bible query filters by `subProfileId = session child`. A child can never list other
  children, parents' emails, billing, account pages or admin. Parent routes reject `sub`
  sessions (existing `parentApiGuard`).
- **PIN**: 4 digits is weak on its own, so it is always paired with a random 6-char Kid Code
  (~887M combinations) and stored as bcrypt(kidCode:PIN). Common PINs (0000, 1234, 1111, ...)
  are refused. Escalating lockout per child: 5 failures -> 1 min, 10 -> 15 min, 15 -> 1 h and an
  email to the owner parent, 20 -> disabled until a parent resets the PIN. Per-IP limit through
  `AuthRateLimit` (`kidpin:ip:<ip>`: 20 failures / 15 min -> 1 h block), independent of the child.
  Same error text for "unknown code" and "wrong PIN".
- **Minimal child data (COPPA-minded)**: first name or nickname only; no birthday, email, photo,
  school or location. Child free text is short (300 chars), only goes to linked parents, never
  public. Deleting a child cascades all Mom's Bible rows. Parents can export (PDF) and delete.
- **No cross-family reach**: `ParentChildLink` is the only way a parent sees a child; invites
  store only a token hash, expire in 7 days, single use, and the owner can remove a co-parent.
- Writes: same-origin check, body size limits, sticker keys whitelisted, text rendered as plain
  text (no HTML), rate limits on notes/items.
- Kid mode should hide the public chapter discussion (open question 10).

---

## 7. Phased PR plan

**Phase 1 (core loop, one parent + several children)**
1. PR 1a: schema + migration SQL (models above, `ParentChildLink` back-fill), Kid Code + PIN
   login, PIN setup/reset in /account, lockout + per-IP limits, tests for auth rules.
2. PR 1b: parent highlights (palette), chapter letter, verse cards with threads, child stickers
   and replies, `MbChapterSeen`, 3 stamps + table of contents, free Genesis 1 preview + Plus modal,
   server-side Plus checks, read-only after expiry.

**Phase 2 (content)**
3. Situation picker (15 situations), prayer chips, weekly verse banner, "Show Mom's highlights
   only" filter, new-note banner with [Open ->], "Send memo to child" from existing memos.

**Phase 3 (family)**
4. Co-parent invites, Mom/Dad tabs, roleLabel editing.
5. "Also send to Leo" batch copy (batchId) and edit-all-copies.
6. `/print/moms-bible/[childId]` PDF.

Each PR: tsc + eslint on changed files, route auth tests (`scripts/test-moms-bible-auth.ts`),
ref-map tests. Migrations are only written, never run by the agent.

---

## 8. Open questions for Jisun

1. Kid login: replace the current Access ID (`CKC-XXXX-XXXX`) with Kid Code + PIN, or keep
   both (Access ID for teachers/classes, PIN for families)?
2. Kid-friendlier option: one family code on the device, then the child taps their name and
   types the PIN. OK, or one Kid Code per child?
3. Co-parent: does Dad sign in with his own email/Google account? If only Mom bought Plus,
   can Dad still write notes (Family Plus covers all linked parents)?
4. After Plus expires, can children still send stickers/replies, or is everything read-only?
5. Existing memos: keep them separate with a "💌 Send to child" copy button (proposed), or
   automatically turn FAMILY-shared parent memos into notes?
6. Confirm the 3 stamp meanings: 💌 parent wrote, 👀 child saw, 🌱 Shared Together.
7. Child replies: free text (max 300) plus stickers, or stickers and preset phrases only for
   younger children (parent setting)?
8. Email the parent when a child replies? (Lockout alerts will email regardless.)
9. Weekly verse: picked by admin (an admin screen or SiteCopy key) or taken from the Sunday
   Gospel automatically?
10. Hide the public chapter discussion when a child is signed in?
11. ✝ reading stickers on `/bible/[book]`: typing is gone from these pages. Fill them with a
    "I read this chapter" button, replace them with Mom's Bible stamps, or retire them?
12. PDF: only chapters that have notes, or the full chapters? Cover text and photo?
13. Keep the limit of 5 children per family?
14. Roles: only Mom / Dad, or also Grandma / Godparent / custom labels?

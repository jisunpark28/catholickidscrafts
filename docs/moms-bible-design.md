# Mom's Bible: design (v3, confirmations 2026-11-04)

Status: Jisun answered the open questions (section 0), so the decisions below are locked. v3 adds
her five confirmations (section 0.1). Phase 1 is broken into four PRs plus a small notice task
(section 12). Step 2 (official numbering on the reader, typing removed from the Old/New
Testament pages, empty "Mom's Notes" column) is on `feat/moms-bible-step2` (PR #283). PR-1
(schema + migration file + Kid Code / PIN helpers) is on `feat/moms-bible-pr1-schema`.
No migration in this document has been run anywhere. The agent writes migration files only;
Jisun runs them, on a Neon branch first and then production
(`docs/moms-bible-migration-runbook.md`).

Scope: only the Old/New Testament reader (`/bible/read/[book]/[chapter]`, `/bible/[book]`),
the child sign-in and the parent account pages.
**Today's Gospel typing (now on `/daily-mass`, Universalis, `GospelTypingSection`,
`PassageTypingGame`, `GospelDayProgress`, faith journal) does not change.**

---

## 0. Locked decisions

| # | Decision |
|---|---|
| 1 | Child sign-in is **Kid Code (e.g. `lily-8492`) + 4-digit PIN**. It **fully replaces** the CKC Access ID. Existing children get an initial Kid Code during the migration. They have no PIN yet, so a child can't sign in until a parent sets one. Parents are asked to set it on their first visit (6.3). |
| 2 | Each child has a **unique Kid Code in the DB**. On the device there's a **Netflix-style profile picker** built from a localStorage list `[{ code, name }]`, plus "➕ Add Kid", then the PIN pad. localStorage holds only code + first name, never a PIN, token or session secret. A parent can remove profiles from the picker. |
| 3 | **Dad signs up with his own email** and is linked to the children. **Family Pass**: `hasPlusAccess(childProfileId)` is true when **any** linked parent has active Plus. Every parent linked to that child may then write to that child. |
| 4 | **After Plus expires**: reading always works. The child may still send a sticker or short reply to **existing parent notes they haven't answered yet** (🟡). New parent highlights, notes, edits and the PDF lock immediately. |
| 5 | **Existing `BiblePassageMemo`s**: when a parent creates their first child, offer a one-click import: "Move your N existing Bible notes to Mia's Bible?". The OT/NT reader UI becomes Mom's Bible only. The original rows are never changed by the import (see concern C5 about deleting them). |
| 6 | **Child replies**: 3 one-click stickers + optional text up to 200 characters. Family-private only. |
| 7 | **Notifications**: in-app banner + email to the parent when a child replies. Cooldown: at most 1 email per hour per parent (or a daily digest, parent's choice). Unsubscribe link + account setting. The provider already exists: **Resend** (see 7). |
| 8 | **✝ chapter stickers are replaced** by stamps (🟣 / 🟡 / 🟢) plus a **"🌱 Shared Together" seed counter** badge for the child. |
| 9 | **PDF `/print/moms-bible/[childId]`**: cover (title, dedication, print date), colour legend, body in Bible order, handwritten blessing box (+ a settings bar that doesn't print). Notes and highlights store a situation tag. Specified in 8; built in Phase 3. |

### 0.1 Confirmations (v3)

| # | Confirmed |
|---|---|
| A | **Kid Code + PIN fully replaces the CKC Access ID** (removed in PR-2). Before PR-2 ships, parents see a **pre-announcement banner/popup for 3–5 days**: "Parents must create the child profile and set a 4-digit PIN before your child can sign in." Small separate task **PR-1b** (12), switched on by a SiteCopy key. |
| B | **Kid Code = name + 4 random digits** (`lily-8492`), system-generated, unique, retried on collision (6.1). **PIN blacklist** rejects repeated digits (`0000`–`9999`), ascending/descending runs (`1234`, `4321`, `0123`, …), `1004`, ABAB/AABB patterns and a small common list, with a validation error (6.1). |
| C | **A free Dad may write notes to linked children only** (Family Pass, 3). Custom sheets, the PDF and the other Plus features need his own Plus. |
| D | **The reply email says only "Mia sent a warm reply to your note! [Open →]"**. No child text, no sticker label, no verse (7). |
| E | **PDF parts**: cover (title, dedication, print date), colour legend, body in Bible order, handwritten blessing box (8). |

---

## 1. What exists today (prisma/schema.prisma)

| Concept need | Already in the code | Gap |
|---|---|---|
| Parent account | `FamilyAccount` (email/Google, `sessionVersion`) | One login per family, no second parent |
| Child | `SubProfile` (displayName, `accessCodeHash` bcrypt, `accessCodeLookup` sha256 unique, `accessCodeLast4`, deprecated `accessCodeDisplay`, `active`, max 5 per family) | No Kid Code, no PIN; belongs to exactly one family |
| Child sign-in | `/api/auth/reader/login` + `ReaderLoginForm` (Access ID), `AuthRateLimit` per IP (`READER_LOGIN_RULE`), child mode / device lock (`enterChildMode`, `effectiveReaderMode`), signed `ckc_reader` cookie | Replaced by Kid Code + PIN |
| Plus | `PlusPass` (`expiresAt`, `revokedAt`), legacy `Subscription`, `PAID_PREVIEW_EMAILS`; `resolveFamilyPlus(familyAccountId)`; `hasPaidFeatures(readerKey)` maps a child to its family | Needs "any linked parent" for a child |
| Memos | `BiblePassageMemo` (Douay book/chapter, verse range + char offsets, colours yellow/sky/green/pink/purple, PRIVATE/FAMILY), `/account/memos`, print page, **today's Gospel faith journal** | Imported into Mom's Bible (decision 5) |
| Email | `src/lib/email.ts`: Resend over `fetch` (no SDK), `sendEmail`, `sendEmailBatch`, `complianceFooter` (CASL address + unsubscribe), List-Unsubscribe headers; env `RESEND_API_KEY`, `EMAIL_FROM`, `MAILING_ADDRESS` | Nothing for Mom's Bible yet |
| Cron | `vercel.json`: `/api/cron/weekly-email` (Fri), `/api/cron/plus-reminders` (daily) | A daily digest cron gets added |

Storage keys stay **Douay-Rheims** (latinprayer `bookSlug`, Douay chapter/verse). The screen and
new editorial content use **NABRE** references, converted with `src/lib/bible/ref-map.ts` and
`src/lib/bible/chapter-pages.ts`.

---

## 2. Prisma models (Phase 1, PR-1)

Additive except the planned `SubProfile` Access ID refactor (2.2).

### 2.1 New models

```prisma
enum MbColor      { YELLOW GREEN BLUE PINK }   // 🟡 Love & Comfort · 🟢 Wisdom & Growth · 🔵 Courage & Peace · 🩷 Mom's Prayer
enum MbAuthorKind { PARENT CHILD }
enum MbItemKind   { TEXT STICKER }
enum MbEmailMode  { INSTANT DIGEST OFF }        // INSTANT = at most 1 per hour

/// Parent <-> child (N:M). The owner link is SubProfile.familyAccountId (isOwner = true).
model ParentChildLink {
  id              String        @id @default(cuid())
  parentAccountId String
  subProfileId    String
  roleLabel       String        // "Mom" | "Dad" | custom (<= 20 chars), shown on notes
  isOwner         Boolean       @default(false)
  createdAt       DateTime      @default(now())
  parent          FamilyAccount @relation(fields: [parentAccountId], references: [id], onDelete: Cascade)
  child           SubProfile    @relation(fields: [subProfileId], references: [id], onDelete: Cascade)
  @@unique([parentAccountId, subProfileId])
  @@index([subProfileId])
}

/// Co-parent invite (UI in Phase 3; table now so links never change shape). Only a token hash is stored.
model ParentInvite {
  id             String    @id @default(cuid())
  ownerAccountId String
  subProfileIds  String[]
  roleLabel      String
  tokenHash      String    @unique
  expiresAt      DateTime  // 7 days, single use
  acceptedAt     DateTime?
  acceptedById   String?
  createdAt      DateTime  @default(now())
  @@index([ownerAccountId])
}

model MbHighlight {
  id             String   @id @default(cuid())
  subProfileId   String   // whose Bible
  authorParentId String
  bookSlug       String   // Douay
  chapter        Int      // Douay
  verse          Int      // Douay
  color          MbColor?
  star           Boolean  @default(false)
  underline      Boolean  @default(false)
  situationKey   String?  // decision 9: tag shown in the PDF
  batchId        String?  // sibling copies (Phase 3)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@unique([subProfileId, authorParentId, bookSlug, chapter, verse])
  @@index([subProfileId, bookSlug, chapter])
  @@index([batchId])
}

/// Chapter letter (startVerse null) or verse card (startVerse..endVerse).
model MbNote {
  id                 String       @id @default(cuid())
  subProfileId       String
  authorParentId     String
  bookSlug           String
  chapter            Int
  startVerse         Int?
  endVerse           Int?
  color              MbColor?
  situationKey       String?      // decision 9, e.g. "losing-a-pet"
  batchId            String?
  importedFromMemoId String?      @unique   // decision 5: idempotent memo import
  childRepliedAt     DateTime?    // first child item; null = 🟡 waiting (expiry rule 4)
  lastActivityAt     DateTime     @default(now())
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
  items              MbNoteItem[]
  @@index([subProfileId, bookSlug, chapter])
  @@index([subProfileId, lastActivityAt])
  @@index([authorParentId, createdAt])
  @@index([batchId])
}
// SQL adds: CREATE UNIQUE INDEX ... ON "MbNote"("subProfileId","authorParentId","bookSlug","chapter") WHERE "startVerse" IS NULL;

model MbNoteItem {
  id             String       @id @default(cuid())
  noteId         String
  authorKind     MbAuthorKind
  authorParentId String?
  authorChildId  String?      // must equal note.subProfileId
  kind           MbItemKind
  body           String?      @db.Text   // parent <= 2000, child <= 200
  stickerKey     String?                 // whitelist (5)
  createdAt      DateTime     @default(now())
  editedAt       DateTime?
  deletedAt      DateTime?
  note           MbNote       @relation(fields: [noteId], references: [id], onDelete: Cascade)
  @@index([noteId, createdAt])
}

model MbChapterSeen {
  subProfileId String
  bookSlug     String
  chapter      Int
  seenAt       DateTime
  @@id([subProfileId, bookSlug, chapter])
}

/// In-app banner + email queue (decision 7).
model MbNotification {
  id             String    @id @default(cuid())
  parentAccountId String
  subProfileId   String
  noteId         String
  itemId         String    @unique
  createdAt      DateTime  @default(now())
  seenAt         DateTime? // parent opened the banner / note
  emailedAt      DateTime? // included in an email
  @@index([parentAccountId, seenAt])
  @@index([parentAccountId, emailedAt])
}

/// Per-parent Mom's Bible settings (email, PDF dedication, picker trust).
model MbParentSettings {
  parentAccountId     String      @id
  emailMode           MbEmailMode @default(INSTANT)
  lastReplyEmailAt    DateTime?
  unsubscribeToken    String      @unique   // random 32 bytes, base64url
  memoImportPromptAt  DateTime?             // decision 5: don't ask twice
  memoImportDoneAt    DateTime?
  updatedAt           DateTime    @updatedAt
}

/// Per-child book settings for the PDF cover (decision 9).
model MbBook {
  subProfileId  String   @id
  dedication    String?  // <= 500 chars
  dedicationBy  String?  // parentAccountId
  updatedAt     DateTime @updatedAt
}
```

Relations get added on `FamilyAccount` and `SubProfile`, all `onDelete: Cascade`, so deleting a
child or a parent account removes their Mom's Bible rows.

### 2.2 SubProfile: Access ID -> Kid Code + PIN (decision 1)

```prisma
model SubProfile {
  ...
  kidCode          String    @unique          // "lily-8492": [a-z]{2,12}-\d{4}, lower case, system-generated
  pinHash          String?                    // bcrypt(cost 10) of `${id}:${pin}`; null = not set yet
  pinSetAt         DateTime?
  pinFailCount     Int       @default(0)
  pinLockedUntil   DateTime?
  pinDisabledAt    DateTime?                  // set after 20 failures; parent must reset
  // legacy Access ID: still required in PR-1 (unchanged), made nullable in the PR-2 migration,
  // dropped in a later cleanup migration:
  accessCodeHash   String
  accessCodeLookup String    @unique
  accessCodeLast4  String?
  accessCodeDisplay String?
}
```

**Mapping existing IDs.** The old Access IDs can't be reused as Kid Codes because the plain IDs
were never stored (only a bcrypt hash, a sha256 lookup and the last 4 characters). The migration
gives every existing child a new code from their name:
`lower(ascii letters of displayName, common accents folded, max 12; "kid" if fewer than 2)` +
`-` + 4 random digits (`0000`–`9999`), retried until unique (gives up with an error after 500
tries, which rolls the whole migration back). New children get the same format from
`src/lib/kids/kid-code.ts` (`generateUniqueKidCode`, `crypto.randomInt`). Codes are
system-generated: parents can ask for a new random code (PR-2) but can't type their own.
PIN is null, so the child can't sign in until a parent sets a PIN (6.3).

**PIN hash** uses the child's `id`, not the code, so renaming a Kid Code doesn't invalidate the
PIN.

---

## 3. Family Pass (decision 3)

```ts
// src/lib/moms-bible/family-pass.ts (server only, never cached across requests)
linkedParentIds(childId)              // ParentChildLink parentAccountId[] (owner included)
hasPlusAccess(childId): boolean       // any linkedParentIds -> resolveFamilyPlus(id).isPlus
canParentRead(parentId, childId)      // link exists
canParentWrite(parentId, childId)     // link exists && hasPlusAccess(childId)
canChildReply(childId, note)          // note.subProfileId === childId &&
                                      //   (hasPlusAccess(childId) || note.childRepliedAt === null)
```

- "Plus" means the existing `resolveFamilyPlus` (active `PlusPass` not revoked, legacy
  subscription, or preview email). A refund (`revokedAt`) takes effect on the next request.
- Family Pass unlocks **Mom's Bible notes/highlights for the linked children only** (confirmed C).
  It doesn't make Dad's own account Plus: custom sheets, the Mom's Bible PDF, printables and
  every other Plus feature check **his own** `resolveFamilyPlus`. So `canParentPrintPdf(parentId,
  childId)` = link exists && `resolveFamilyPlus(parentId).isPlus`.
- `hasPaidFeatures(readerKey)` for a **child** session also switches to `hasPlusAccess`, so a
  child linked to a paying Dad gets the same as a child of a paying Mom.

Expiry matrix (decision 4):

| Action | Plus active | Plus expired |
|---|---|---|
| Parent/child read highlights, notes, threads | ✅ | ✅ |
| Parent new/edit highlight, note, letter, sticker | ✅ | ❌ (Plus modal) |
| Parent PDF (needs the parent's **own** Plus) | ✅ | ❌ |
| Child sticker / text reply to a note with `childRepliedAt = null` (🟡) | ✅ | ✅ one reply each (1 item; then it is 🟢) |
| Child further replies on a 🟢 note | ✅ | ❌ |
| Email to parent for that reply | ✅ | ✅ (it is the re-subscribe trigger) |

---

## 4. Child replies and stickers (decision 6)

- 3 one-click stickers per note thread. The label follows the note author's `roleLabel`:
  `love` "❤️ Love you, {Mom}!", `prayed` "🙏 I prayed for this", `thanks` "🌟 Thank you, {Mom}!".
  Keys are whitelisted server-side.
- Optional text: up to 200 characters, plain text (rendered escaped), trimmed, no links made
  clickable. Only the child and the parents linked to that child can see it. It never appears
  in the public discussion, sitemap or any other family's view.
- Rate limit per child: 30 items in 10 minutes (`AuthRateLimit` key `mb:child:<id>`).

---

## 5. Stamps and seeds (decision 8)

Calculated from the tables when a page loads (indexed), not stored. Stamp per child × chapter
(all linked parents together). Only one stamp shows per chapter, the one that needs action first:

| Stamp | When |
|---|---|
| 🟡 **Waiting for You** | any parent note in the chapter with `childRepliedAt = null` |
| 🟢 **Shared Together** | otherwise, at least one note answered by the child |
| 🟣 **Mom's highlights** | otherwise, only highlights (no notes) |
| (none) | nothing from a parent |

- `/bible/[book]` grid (`chapterGrid()`, official numbering) shows stamps instead of ✝.
  `BibleChapterProgress` rows stay in the DB untouched but are no longer shown on OT/NT book
  pages. Gospel stickers use `GospelDayProgress`, which doesn't change.
- "✨ Show Mom's highlights only" filters the grid to stamped chapters (Phase 2).
- **🌱 seeds counter** = number of chapters (all books) the child has turned 🟢, i.e. chapters
  where the child answered at least one note. Badge "🌱 Shared Together: 14 seeds" in the child's
  header on the Bible pages and the hub.

---

## 6. Kid Code + PIN sign-in (decisions 1, 2)

### 6.1 Formats and rules
- Kid Code `^[a-z]{2,12}-\d{4}$` (`lily-8492`): name letters + 4 random digits,
  system-generated, unique (DB unique index + retry on collision, up to 25 tries in the app),
  shown to the parent. A parent can get a new random code; nobody types a custom one.
  Input is case-insensitive and trimmed (`normalizeKidCode`). Code: `src/lib/kids/kid-code.ts`.
- PIN: exactly 4 digits, stored only as a bcrypt hash. `src/lib/kids/pin-policy.ts`
  (`checkPin`) rejects, with a validation error shown under the PIN field:
  - repeated digits: `0000`, `1111` … `9999`;
  - ascending/descending runs: `0123` … `6789`, `9876` … `3210`, and wrap-arounds `7890`,
    `8901`, `9012`, `0987`, `1098`, `2109`;
  - patterns ABAB / AABB: `1212`, `3434`, `1122`, `9988`;
  - common PINs: `1004` (천사), `2580`, `0852`, `1379`, `1397`, `7777`, `1010`, `2000`,
    `2020`, `1999`, `6969`, `4200`, `1984`, `0007`, `1001`, `0101`, `1314`, `5683`, `1470`,
    `0741`.
  9,775 of the 10,000 PINs stay allowed.

### 6.2 Device picker (`/kids`, replaces the `/reader/login` form)
- localStorage key `ckc.kidProfiles` = `[{ code, name }]`, max 8 entries, first name only.
  **Never** PIN, session token, family id or email.
- Screen: profile tiles [👧 Mia] [👦 Leo] [➕ Add Kid]. Tap a tile and the 4-digit PIN pad
  appears. "Add Kid" asks for Kid Code + PIN and adds the tile after a successful sign-in only.
- Removing a tile ("Edit profiles") needs a parent: it shows only when a parent session is
  active on the device (not in child mode). Parents also get "Forget kid profiles on this
  device" in /account.
- Sign-in sets the existing signed `ckc_reader` cookie (httpOnly, SameSite=Lax, Secure). It
  reuses `signReaderSession` and the `sessionVersion` / `active` checks in `getReaderKey`.
  Child mode / device lock (`enterChildMode`) keeps working the same way.

### 6.3 Children without a PIN
- `POST /api/auth/kid/login` returns the same generic error as a wrong PIN ("That code or PIN
  didn't work. Ask a grown-up to check Account → Children"), so it can't be used to find codes.
- **Parent first visit**: if any linked child has `pinHash = null`, the parent gets a blocking
  "Set a 4-digit PIN for Mia" dialog on `/account` and a banner on the Bible pages, until every
  active child has a PIN. The parent can "Skip for now" (the child just can't sign in).
- Setting/resetting a PIN, renaming a code and re-enabling a locked child need a parent session
  (not child mode, `parentApiGuard`) + same-origin. They clear `pinFailCount`, `pinLockedUntil`
  and `pinDisabledAt`, and bump nothing else.

### 6.4 Lockout (Kid Codes like `lily-8492` aren't secret, so the PIN is the real secret)
- Per child: 5 failures → 1 min, 10 → 15 min, 15 → 1 h + email to linked parents,
  20 → `pinDisabledAt` (parent reset required) + email. The counter resets on success.
  So at most 20 guesses per child out of 10,000 PINs (0.2%) before a parent is involved.
- Per IP: `AuthRateLimit` `kidpin:ip:<ip>`: 20 failures / 15 min → 1 h block.
- Constant-time-ish: always run one bcrypt compare (against a dummy hash for unknown codes).
- The old Access ID endpoint returns a 410 with "Sign in with your Kid Code" after PR-2.

### 6.5 Pre-announcement (PR-1b, before PR-2)
- Text: **"Parents must create the child profile and set a 4-digit PIN before your child can
  sign in."** (+ link "Go to Account → Children").
- Where: a banner on `/reader/login` (the page children use today) and a one-time popup on
  `/account` for parents with children; dismissal stored in localStorage
  (`ckc.kidLoginNoticeDismissed`, no personal data).
- Switch: SiteCopy key `notice.kid_login_change.enabled` (default `off`) + text key
  `notice.kid_login_change.text`, edited in the existing admin SiteCopy editor, so no deploy is
  needed to turn it on. Ships with or right after PR-1; Jisun turns it on **3–5 days before
  PR-2** and off after PR-2 is live (PR-2 then shows the PIN setup dialog, 6.3).
- Optional: one email to parents with active children (Resend, `sendEmailBatch`), same text.

---

## 7. Notifications (decision 7)

Provider: **Resend, already in the repo** (`src/lib/email.ts`, plain `fetch` to
`api.resend.com`, no SDK). Nothing to install. It uses `complianceFooter` (CASL mailing address)
and `unsubscribeUrl` (List-Unsubscribe one-click headers).

Flow when a child adds a sticker or reply:
1. Create one `MbNotification` per linked parent who wrote in that thread (the note's author;
   other linked parents only if they wrote items in it).
2. **In-app**: the parent sees a banner on Bible pages and /account: "💌 Mia replied to your note
   on Psalm 34 [Open →]" (unseen notifications, newest first, max 3 + "and N more").
3. **Email**, by `MbParentSettings.emailMode`:
   - `INSTANT` (default): send now if `lastReplyEmailAt` is more than 1 hour ago. Otherwise the
     notification waits, and the next email (or the daily cron) says "Mia sent 3 replies".
   - `DIGEST`: only the daily cron.
   - `OFF`: in-app only.
4. Daily cron `/api/cron/moms-bible-digest` (add to `vercel.json`, e.g. `0 23 * * *`, protected
   with the same `CRON_SECRET` check as the other crons). It emails every parent with
   un-emailed, unseen notifications older than 1 hour, then sets `emailedAt`. This also works on
   Vercel plans that only allow daily crons.
- Email content (confirmed D) is only: **"Mia sent a warm reply to your note! [Open →]"**
  (child's first name, link to the note). No child text, no sticker label, no verse, so the
  child's words stay on the site. Digest version: "Mia sent 3 warm replies to your notes!
  [Open →]". Subject "💌 Mia sent a warm reply to your note". The required `complianceFooter`
  and unsubscribe link are added as in the other emails.
- Unsubscribe: `/api/moms-bible/unsubscribe?token=` (GET page + POST one-click). It sets
  `emailMode = OFF` and can be changed back in /account → Notifications.

---

## 8. PDF `/print/moms-bible/[childId]` (decision 9, built in Phase 3)

Server page. Linked parent only, and needs the parent's **own** active Plus (confirmed C;
locked when expired). `@media print`, Letter and A4. Printed parts (confirmed E): cover, colour
legend, body in Bible order, handwritten blessing box.

1. **Settings bar** (class `print:hidden`): [✅ Include Dad's Notes] [✅ Include Mia's Replies]
   (query `?others=0&replies=0`; "Dad" = the other linked parents' role labels), dedication
   editor (saves `MbBook.dedication`), [🖨️ Print].
2. **Cover**: title "{roleLabel}'s Prayer Bible for {Mia}" ("Mom & Dad's" when other parents'
   notes are included), subtitle "A Legacy of Faith & Love", dedication (`MbBook.dedication` +
   `dedicationBy`), print date (Toronto date).
3. **Colour legend**: 🟡 Love & Comfort / 🟢 Wisdom & Growth / 🔵 Courage & Peace /
   🩷 Mom's Prayer, plus ⭐ / underline meaning.
4. **Body**: Bible (canonical) order (Genesis → Revelation), then chapter, then verse. Official
   references. For each entry: verse text with the highlight colour as background, ⭐/underline,
   situation tag (e.g. "🐾 Losing a Pet" from `situationKey`), parent letter/notes with role
   and date, the child's stickers/replies with date. Chapter letters come before verse cards.
   Page breaks avoid splitting an entry.
5. **Handwritten blessing box** (final page): "✍️ A Handwritten Blessing from Mom & Dad" empty
   ruled box + signature line.
- Verse text is fetched from latinprayer (cached a day). Limit to chapters that have content.

---

## 9. Memo import (decision 5)

- Trigger: when `POST /api/account/subs` creates the family's **first** child and the parent owns
  memos (`familyAccountId = parent`, `subProfileId = null`, visibility PRIVATE/FAMILY, OT/NT
  books), the response includes `memoImport: { count }`. The UI asks "Move your N existing Bible
  notes to Mia's Bible? [Move them] [Not now]". "Not now" sets `memoImportPromptAt`. The offer
  stays in /account → Mom's Bible until done.
- Import (`POST /api/moms-bible/import-memos { childId }`, parent + same-origin; **allowed
  without Plus**: it is the parent's own content): one transaction. Each memo becomes one
  `MbNote` verse card (`startVerse/endVerse` as stored, Douay) + one PARENT TEXT item (memo
  body, original `createdAt`). Colour map: yellow→YELLOW, green→GREEN, sky→BLUE, pink→PINK,
  purple→PINK (C5). `importedFromMemoId` makes it idempotent. Sets `memoImportDoneAt`.
- **Original `BiblePassageMemo` rows are not changed or deleted.**
- After import the OT/NT reader no longer shows the old memo UI (`usePassageMemos`); the right
  column is Mom's Bible. `/account/memos` stays reachable, read-only, for the Gospel faith journal.

---

## 10. API routes and auth rules

Common rules:
- Identity only from the signed session (`getReaderKey()`), never from the body. A `childId` is
  a selector, always checked against `ParentChildLink` (parent) or equal to the session child.
- Writes: `Origin` must equal the site host (pattern from `/api/admin/site-copy`), JSON size
  limit, plain text only. Admin sessions get no family data.
- Plus checks run on the server in every write route (UI gating in PR-4 is only UX).

| Route | Who | Rule |
|---|---|---|
| `POST /api/auth/kid/login` | anyone | 6.4 limits |
| `POST /api/auth/kid/logout` | child | clears `ckc_reader` |
| `POST /api/account/subs` | parent | creates child + Kid Code + owner link (done in PR-1), optional PIN and memo import offer (PR-2/PR-4) |
| `PATCH /api/account/subs/[id]` | linked owner parent | rename; "new random Kid Code" (unique) |
| `PUT /api/account/subs/[id]/pin` | linked parent | set/reset PIN, clears lockout |
| `GET /api/moms-bible/chapter?child=&book=&chapter=` | linked parent / that child | highlights, notes, items, stamps for one reader page |
| `PUT /api/moms-bible/highlights` | `canParentWrite` | upsert/clear one verse |
| `POST /api/moms-bible/notes`, `PATCH/DELETE /notes/[id]` | `canParentWrite`; author only for edit/delete | letter or verse card |
| `POST /api/moms-bible/notes/[id]/items` | parent: `canParentWrite`; child: `canChildReply` | sticker or text |
| `DELETE /api/moms-bible/items/[id]` | item author | soft delete |
| `POST /api/moms-bible/seen` | child | `MbChapterSeen` |
| `GET /api/moms-bible/stamps?child=&book=` | linked parent / that child | book grid stamps |
| `GET /api/moms-bible/summary?child=` | linked parent / that child | seeds count, newest 🟡 note (banner) |
| `GET/POST /api/moms-bible/notifications` | parent | banner list, mark seen |
| `PUT /api/moms-bible/settings` | parent | email mode |
| `GET/POST /api/moms-bible/unsubscribe` | token | email OFF |
| `POST /api/moms-bible/import-memos` | parent | section 9 |
| `GET /api/cron/moms-bible-digest` | cron secret | section 7 |

---

## 11. Phases

- **Phase 1** (section 12): schema, Kid Code/PIN + picker, highlights/notes/stickers/stamps +
  notifications, free preview + Plus gate + memo import.
- **Phase 2**: situation picker (15 situations, table below), prayer chips, weekly verse
  banner, "Show Mom's highlights only" filter.
- **Phase 3**: co-parent invites + Mom/Dad tabs, "Also send to Leo" (batchId), PDF (section 8).

Situations (static `src/data/moms-bible/situations.ts`, NABRE refs, all 30 checked exact with
`nabreToDouay`):

| Group | Situation (key) | NABRE refs |
|---|---|---|
| 🟡 Love & Comfort | Losing a pet (`losing-a-pet`) | Ps 34:19, Mt 5:4 |
| | Feeling sad / failed (`feeling-sad`) | Is 41:10, Ps 147:3 |
| | Lonely / no friends (`lonely`) | Dt 31:6, Jn 15:15 |
| | Bullying and hurt (`bullying`) | Ps 34:18-19, Is 41:13 |
| 🟢 Wisdom & Growth | Telling a lie (`honesty`) | Eph 4:25, Prv 12:22 |
| | Anger and fighting (`anger`) | Jas 1:19, Eph 4:32 |
| | Sharing and kindness (`sharing`) | Heb 13:16, Lk 6:31 |
| | Screen time and comparison (`screen-time`) | Rom 12:2, Prv 4:23 |
| 🔵 Courage & Peace | Moving / new school (`moving`) | Jos 1:9, Ps 23:1-4 |
| | Nightmares and fear (`nightmares`) | Ps 4:9, Phil 4:6-7 |
| | Before a test (`big-day`) | Phil 4:13, Prv 3:5-6 |
| | Anxiety about tomorrow (`anxiety`) | Mt 6:34, 1 Pt 5:7 |
| 🩷 Mom's Prayer | Birthday / First Communion (`celebration`) | Nm 6:24-26, Jer 29:11 |
| | Just because I love you (`just-because`) | Zep 3:17, 1 Cor 13:4-7 |
| | Blessing your dreams (`dreams`) | Mt 5:16, Eph 2:10 |

---

## 12. Phase 1 PR breakdown

Every PR: `tsc --noEmit` (ignoring stale `.next/types`), eslint on changed files,
`scripts/test-bible-ref-map.ts`, `scripts/test-bible-chapter-pages.ts`, plus the PR's own test
script. Today's Gospel files untouched. The agent never commits, pushes or runs migrations.

### PR-1: schema + migration SQL file + Kid Code / PIN helpers (built, `feat/moms-bible-pr1-schema`)
Branched from `feat/moms-bible-step2` (PR #283 wasn't merged yet), so merge #283 first.
Files
- `prisma/schema.prisma`: models in 2.1, SubProfile `kidCode` (required, unique) + PIN columns,
  relations. The `accessCode*` columns are **unchanged (still required)** so today's Access ID
  sign-in keeps working until PR-2.
- `prisma/migrations/20261105120000_moms_bible_phase1/migration.sql`, one transaction
  (`BEGIN`/`COMMIT`): enums, tables, indexes (incl. the partial unique index for chapter
  letters), SubProfile columns; `kidCode` added nullable → back-filled (`name-NNNN`, random,
  unique, retried) → `SET NOT NULL` → unique index; one owner `ParentChildLink` per SubProfile
  (`roleLabel 'Parent'`, `isOwner`); `MbParentSettings` per FamilyAccount (`INSTANT`, random
  64-hex `unsubscribeToken` from `gen_random_uuid()`, built into Postgres 13+).
- `src/lib/kids/kid-code.ts` (format, normalize, name part, random candidate, unique retry).
- `src/lib/kids/pin-policy.ts` (`checkPin` weak-PIN rules, 6.1).
- `src/app/api/account/subs/route.ts`: new children get a Kid Code + owner link at creation
  (needed because `kidCode` is required).
- `scripts/test-kid-code-pin.ts`.
- `docs/moms-bible-migration-runbook.md`: Neon branch test → production → rollback.

Checks done
- `npx prisma validate`, `npx prisma generate` (local client only).
- The migration ran on a throwaway local Postgres (main schema + 300 sample children): every
  child got a unique valid code and an owner link, every family got settings, `pinHash` null;
  `prisma migrate diff` from that DB to the new schema is empty; an injected failure left the
  DB unchanged.
- `scripts/test-kid-code-pin.ts`, `tsc --noEmit`, eslint.

Not in PR-1: making `accessCode*` nullable (PR-2 migration), any UI, sign-in changes.
New FamilyAccounts get `MbParentSettings` lazily (upsert on first use, PR-3).

### PR-1b: pre-announcement notice (small, separate)
- `src/components/KidLoginNoticeBanner.tsx` (same pattern as `PlusExpiryBanner`), rendered on
  `/reader/login` and `/account`; SiteCopy defaults for the two keys in 6.5 (`enabled` = `off`).
- No schema change, can merge any time before PR-2. Turned on 3–5 days before PR-2.

### PR-2: Kid Code + PIN sign-in + profile picker
Files
- Migration `…_kid_login_pr2`: `accessCodeHash` / `accessCodeLookup` nullable.
- `src/lib/kids/kid-pin.ts` (bcrypt hash/verify with child id, lockout steps; uses
  `checkPin` from PR-1's `pin-policy.ts`).
- `src/lib/rate-limit.ts` (`KID_PIN_IP_RULE`).
- `src/app/api/auth/kid/login/route.ts`, `src/app/api/auth/kid/logout/route.ts`.
- `src/app/api/auth/reader/login/route.ts` → 410 + message.
- `src/app/api/account/subs/route.ts`, `[id]/route.ts`, `[id]/pin/route.ts` (new);
  `[id]/regenerate/route.ts` becomes "new random Kid Code".
- `src/app/(site)/kids/page.tsx` (picker), `src/app/(site)/reader/login/page.tsx` → redirect to `/kids`.
- `src/components/kid/KidProfilePicker.tsx`, `KidPinPad.tsx`, `src/lib/kid-device-profiles.ts`
  (localStorage `{code,name}` only).
- `src/components/SubProfilesManager.tsx` (Kid Code + PIN UI, lock status, reset),
  `src/components/kid/PinSetupDialog.tsx` + banner (6.3).
- `src/lib/access-code.ts` (stop using; delete in the cleanup migration PR).
- `src/lib/moms-bible/lockout-email.ts` (Resend via `sendEmail`).
- `scripts/test-kid-pin.ts` (lockout, hashing).

Acceptance
- A child with a PIN signs in with `lily-8492` + PIN from `/kids`. The tile appears, and next time
  tapping it and typing the PIN is enough.
- Wrong PIN, unknown code and "no PIN yet" give the same error text.
- Lockout steps 5/10/15/20 and the IP rule work (unit test with a fake clock). Parents get an
  email at 15 and 20 failures.
- localStorage never contains anything except `code` and `name` (test + manual check).
- A parent with a child without a PIN sees the PIN dialog on `/account`. After setting it the
  child can sign in. The child can't change their own PIN.
- Removing picker tiles needs a parent session.
- Old Access ID login is gone (410) and nothing in the UI asks for `CKC-`.
- Child sessions still can't reach parent routes (`parentApiGuard`) and still can't read other
  families' data.

### PR-3: highlights, notes, stickers, stamps (+ notifications)
Files
- `src/lib/moms-bible/family-pass.ts` (section 3), `access.ts` (link checks), `queries.ts`,
  `stamps.ts`, `stickers.ts`, `notify.ts` (in-app + Resend, cooldown).
- API routes from section 10 (chapter, highlights, notes, items, seen, stamps, summary,
  notifications, settings, unsubscribe) + `src/app/api/cron/moms-bible-digest/route.ts`,
  `vercel.json` cron entry.
- `src/components/bible/MomsNotesPanel.tsx` (replaces `MomsNotesPlaceholder` for parents and
  children), `VersePalette.tsx` (tap a verse number: 4 colours, ⭐, underline),
  `ChapterLetterCard.tsx`, `VerseNoteCard.tsx`, `NoteThread.tsx`, `StickerBar.tsx`,
  `ChildSwitcher.tsx` ("Viewing Mia's Bible ▼"), `NewNoteBanner.tsx` ([Open →] to `#v-34-19`),
  `SeedsBadge.tsx`, `ParentReplyBanner.tsx`.
- `src/components/bible/BibleChapterPassage.tsx` (highlight classes from Mom's Bible data,
  verse-number tap target), `BibleChapterReadClient.tsx`.
- `src/components/bible/BibleBookHub.tsx` + `StampGrid.tsx` (replaces ✝ grid).
- `src/lib/subscription/entitlements.ts` (`hasPaidFeatures` for child sessions → `hasPlusAccess`).
- `/account` notification setting.
- `scripts/test-moms-bible-auth.ts`.

Acceptance
- A parent picks a child, highlights verses (4 colours, star, underline), writes a chapter
  letter and verse cards. The child sees them with the "Waiting for You" banner and replies with
  one of 3 stickers or text up to 200 characters.
- Stamps 🟡/🟢/🟣 show correctly on `/bible/[book]` (official numbering). The seed count matches
  🟢 chapters.
- The auth test proves:
  - a parent can't read or write a child without a link;
  - a child can't read another child;
  - a child can't create notes or highlights;
  - expired Plus blocks parent writes but allows exactly one child reply on a 🟡 note;
  - stickers outside the whitelist are rejected;
  - text over 200 is rejected;
  - cross-origin writes get 403.
- Email: the first reply sends 1 email, more replies within 1 hour send none, and the cron sends
  the rest. `DIGEST`/`OFF` are respected. The unsubscribe link works without signing in.
- Memo highlights from `BiblePassageMemo` no longer render on OT/NT pages for parents who
  imported (PR-4 removes the old UI completely).

### PR-4: free preview, Plus gate UX, memo import
Files
- `src/data/moms-bible/sample-genesis-1.ts` (static sample: highlights, a letter, a thread).
- `src/components/bible/MomsBibleFreePreview.tsx` (Genesis 1 for guests / non-Plus parents),
  `PlusModal.tsx` (reuse /subscribe copy, $5.99 / 30 days, $29.99 / 365 days, one-time),
  `ExpiredReadOnlyNotice.tsx`.
- `src/app/api/moms-bible/import-memos/route.ts`, `src/components/bible/MemoImportDialog.tsx`,
  hook in `SubProfilesManager` after first child creation, /account entry.
- `src/components/bible/BibleChapterPassage.tsx`: remove `usePassageMemos` from OT/NT pages
  (the hook and `/account/memos` stay for the Gospel faith journal).
- `scripts/test-memo-import.ts`.

Acceptance
- Guest or free parent: Genesis 1 shows the sample (no DB rows). Any write action opens the Plus
  modal, and the server also refuses.
- Expired parent: everything readable, write buttons show the Plus modal, PDF link locked. The
  child's one-reply rule works.
- First child creation with N parent memos shows the dialog with the right N.
- Import creates N notes once (running it twice creates nothing new). Original memo rows are
  byte-for-byte unchanged. Colours are mapped. The Gospel faith journal still shows its memos.
- No memo UI left on OT/NT pages. Today's Gospel page unchanged.

---

## 13. Security summary

- Kid sessions isolated: a kid token resolves only to its own `subProfileId`, and every query
  filters by it. No account, billing, admin or other-child access.
- PIN: bcrypt, weak-PIN blacklist, per-child lockout capped at 20 guesses, per-IP limit,
  generic errors, parent alerts. Kid Codes are treated as public.
- localStorage: code + first name only.
- Minimal child data: first name/nickname, Kid Code, PIN hash, the child's own replies. No
  birthday, email, photo or school. Deleting a child cascades.
- Family-private content: notes, replies and highlights are visible only to the child and linked
  parents. Emails say only "Mia sent a warm reply to your note!".
- Server-side Plus and link checks on every write; same-origin checks; plain-text rendering.

---

## 14. Concerns about the decisions (for Jisun)

- **C1 Teachers / classes.** `SubProfile` was built as "student under a teacher account". If any
  teacher uses Access IDs for a class, PR-2 changes their login and they'll need a PIN per student.
  Check the production count of families with several active SubProfiles before PR-2.
- **C2 Guessable codes (resolved in v3).** Codes are now `name-NNNN` (10,000 per name) and the
  PIN blacklist refuses `1004` and the other common PINs. Remaining risk: someone who knows a
  code can lock a child out (a parent reset fixes it). Children whose names have no Latin
  letters (e.g. 민지) all share the `kid-NNNN` space (10,000 codes in total); fine at today's
  size, revisit if it gets crowded.
- **C3 Family Pass scope (resolved in v3).** A free Dad writes notes to linked children only;
  the PDF, custom sheets and other Plus features need his own Plus.
- **C4 Day-one lockout.** Existing children can't sign in after PR-2 until a parent sets a PIN.
  Covered by PR-1b (6.5): turn the notice on 3–5 days before PR-2.
- **C5 Memo import.** Purple memos have no Mom's Bible colour (mapped to 🩷 pink). Children's own
  memos aren't imported (they aren't parent notes). Deleting originals after import would break
  the Gospel faith journal (it reads the same table), so the plan keeps originals for good.
- **C6 Email content (resolved in v3).** Only "Mia sent a warm reply to your note! [Open →]".
- **C7 Daily cron limits.** If the Vercel plan is Hobby, crons run once a day. The design works
  with that (instant email + daily catch-up), but "1 per hour" depends on new replies arriving.
- **C8 PDF size.** Big books (e.g. many Psalms with notes) mean many chapter fetches when the PDF
  page loads. Fine for now, cache per chapter; consider a limit or pagination later.
- **C9 Production auto-migrates.** `scripts/vercel-build.sh` runs `prisma migrate deploy` on
  every production build, so **merging PR-1 into `main` runs the migration on production**.
  Test it on a Neon branch first (runbook). Preview deploys don't migrate (they share the DB).
- **C10 Code rollback after PR-1.** Once `kidCode` is required, rolling the app back to a
  pre-PR-1 deploy breaks "add child" (the old code doesn't set `kidCode`). Roll back the schema
  too (runbook, rollback section) or fix forward.

# Home Learn Hub & Bible Reading — Implementation Spec

North American English UI. Catholic content (73-book canon).

## 1. Product overview

| Layer | Purpose |
|-------|---------|
| **Home (`/`)** | Learn hub: Daily Mass toggle + admin-managed section pills (mockup layout) |
| **Bible Reading** | Douay-Rheims typing + praise stickers (73 books, chapter grid) |
| **Family accounts** | Parent signup; up to 30 sub-profiles with Access ID login |
| **Admin** | CRUD for home sections/items; existing admins for resources, games copy, etc. |

## 2. Home page layout (mockup)

```
┌ Header: [Search]  [Logo]  [MENU] ─────────────────┐
│  ┌──────────────────────────────────────────┐  │
│  │         Daily Mass  (primary pill)        │  │  ← tap toggles calendar
│  └──────────────────────────────────────────┘  │
│  [ collapsible liturgical calendar ]             │
│                                                  │
│  Bible Reading                                   │
│  ┌ Today's Gospel ─────────────────────────┐   │
│  ┌ Old Testament ──────────────────────────┐   │
│  ┌ New Testament ──────────────────────────┐   │
│                                                  │
│  Liturgical Catechesis                           │
│  ┌ Easter Season ──────────────────────────┐   │
│  … more sections from DB …                       │
└──────────────────────────────────────────────────┘
```

- **Daily Mass pill**: `home.daily_mass.label` in site copy (default: "Daily Mass"); calendar open/closed in `localStorage` optional.
- **Sections**: `HomeSection` + `HomeSectionItem` in Postgres; admin at `/admin/home-sections`.
- **Pills**: same `HomeNavPill` component (hand-drawn sketch border).

## 3. Data models (Prisma)

### 3.1 Home navigation (admin-managed)

```prisma
model HomeSection {
  id        String   @id @default(cuid())
  title     String   // "Bible Reading"
  sortOrder Int      @default(0)
  published Boolean  @default(true)
  items     HomeSectionItem[]
}

model HomeSectionItem {
  id        String   @id @default(cuid())
  sectionId String
  title     String   // "Old Testament"
  href      String   // "/bible/old-testament"
  sortOrder Int      @default(0)
  published Boolean  @default(true)
  section   HomeSection @relation(...)
}
```

### 3.2 Bible progress & family

```prisma
model FamilyAccount {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  displayName  String?
  subProfiles  SubProfile[]
  progress     BibleChapterProgress[] @relation("OwnerProgress")
}

model SubProfile {
  id              String   @id @default(cuid())
  familyAccountId String
  displayName     String   // "Room 3A"
  accessCodeHash  String
  accessCodeLast4 String?
  active          Boolean  @default(true)
  sortOrder       Int      @default(0)
  progress        BibleChapterProgress[] @relation("SubProgress")
  // max 30 per family — enforced in API
}

model BibleChapterProgress {
  id              String    @id @default(cuid())
  bookSlug        String    // latinprayer slug, e.g. genesis
  chapter         Int
  completedAt     DateTime  @default(now())
  typingAccuracy  Float?
  familyAccountId String?
  subProfileId    String?
  @@unique([familyAccountId, bookSlug, chapter])
  @@unique([subProfileId, bookSlug, chapter])
}
```

**Reader session**: cookie `ckc_reader` = `{ type: "owner"|"sub", id }` (separate from admin NextAuth).

## 4. Bible text API

**Source**: [Latin Prayer Douay-Rheims JSON](https://latinprayer.org/bible/) (public domain, 73 books, CORS).

- Server proxy: `GET /api/bible/chapter/[book]/[chapter]` → caches 24h
- Book list: `GET /api/bible/books?testament=OT|NT`
- Typing page: `GET /bible/read/[book]/[chapter]` — reuse `PassageTypingGame` pattern
- On completion (accuracy threshold): `POST /api/bible/progress`

**Today's Gospel**: `GET /api/bible/gospel/today` — gospel from Mass/Universalis or USCCB calendar + Douay chapter proxy.

## 5. Bible UI (stickers)

Route: `/bible/[bookSlug]` (e.g. `/bible/genesis`)

- Book dropdown: OT (46) / NT (27) at `/bible/old-testament` and `/bible/new-testament`
- Grid of `chapterCount` cross stickers; filled when `BibleChapterProgress` exists
- Requires reader login for persistence; guests see empty grid + CTA

## 6. Auth flows

| User | Login | URL |
|------|-------|-----|
| Parent | email + password | `/account/signup`, `/account/login` |
| Sub | Access ID only | `/reader/login` |
| Parent dashboard | manage subs, view progress | `/account` |

Access ID format: `CKC-XXXX-XXXX` (crypto random); store bcrypt hash only.

## 7. API summary

| Method | Path |
|--------|------|
| GET | `/api/home-sections` |
| GET/POST/PUT/DELETE | `/api/admin/home-sections` |
| GET | `/api/bible/books` |
| GET | `/api/bible/chapter/[book]/[chapter]` |
| GET/POST | `/api/bible/progress` |
| POST | `/api/auth/family/signup` |
| POST | `/api/auth/family/login` |
| POST | `/api/auth/reader/login` |
| GET/POST/DELETE | `/api/account/subs` |

## 8. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **A** | Home hub, Daily Mass toggle, admin sections, seed English defaults |
| **B** | Bible book picker + sticker grid + latinprayer proxy |
| **C** | Chapter typing + `POST /api/bible/progress` (90% accuracy; guest `ckc_bible_reader` cookie) |
| **D** | Family account + Access ID + sub limit 30 | **Done** |
| **E** | Home search across resources + games + catalog | **Done** |

## 9. Default English seed (home sections)

**Bible Reading**

- Today's Gospel → `/bible/gospel`
- Old Testament → `/bible/old-testament`
- New Testament → `/bible/new-testament`

**Liturgical Catechesis**

- Easter Season → `/resources?period=easter`
- Advent → `/resources?period=advent`
- Lent → `/resources?period=lent`

Operators add/remove sections and pills in admin without deploy.

## 10. Privacy

- Sub profiles: display name only; no child email.
- Progress stored per reader; not used for ads.
- Update `/privacy` when Phase D ships.

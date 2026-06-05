# Daily Mass readings — sources and compliance

Operator reference for **catholickidscrafts.com** `/mass` and related APIs.

## Summary (한국어)

| 방식 | 저작권·합법성 | **공개 사이트 동작 (현재)** |
|------|----------------|---------------------------|
| **Evangelizo Reader API** | 메타데이터·인용; 전문 재게시는 USCCB/CCD 허가 필요 | **`/mass` 달력**: 전례일 **제목**만 표시. API는 서버에서 호출. |
| **USCCB / Living with Christ** | 본문은 각 공식 사이트 저작권 | **`/mass`**: 외부 링크만 (본문 HTML에 표시 안 함). |
| **USCCB RSS** | 비유료 사이트 RSS 표시 허용 ([RSS 안내](https://www.usccb.org/subscribe/rss)) | 공개 HTML에는 미표시. `GET /api/mass/[date]`가 RSS 본문을 JSON으로 줄 수 있음(프론트 미사용). |
| **Evangelizo 전문 재게시** | 운영자 책임 | `MASS_REPUBLISH_EVANGELIZO=true` 일 때만 (`fetchMassDay`). 기본 **off**. |
| **Universalis JSONP** | [Webmasters terms](https://universalis.com/n-web.htm) | **Typing → Today’s Bible**만: **오늘** 본문 on-site + 저작권 문구 + Universalis 링크. USCCB와 다른 역본/역. |

`/mass/YYYY-MM-DD` 는 **`/mass`로 리다이렉트**됩니다. 날짜별 미사 전문 페이지는 없습니다.

## Public `/mass` page

1. Month calendar with **liturgical titles** (Evangelizo, ~30-day window around today).
2. Buttons to **Living with Christ** and **USCCB** for full reading texts (new tabs).
3. No lectionary body copy in the public HTML.

Site copy (editable in admin **Site text**): *“Text stays on their site—we link you there.”*

## Official / open options reviewed

1. **USCCB Daily Readings (bible.usccb.org)**  
   - Canonical English (U.S. Lectionary).  
   - **RSS**: permitted display on a non-paywalled website per USCCB permissions page.  
   - **Not permitted** without license: scraping HTML outside RSS terms, podcasts of full readings, worship projection, paid apps.

2. **USCCB permissions (general)**  
   - [Bible Permissions](https://www.usccb.org/offices/new-american-bible/permissions)  
   - [Copyright permission requirements](https://www.usccb.org/committees/divine-worship/policies/copyright-permissions-requirements)

3. **Evangelizo.org Reader API**  
   - Convenient JSON/HTML feed; includes CCD copyright notice in text.  
   - **Not a substitute for USCCB license** for republishing full lectionary text on your own pages.

4. **Public-domain Bible translations**  
   - Do **not** match the U.S. Lectionary pericopes for Mass; unsuitable for “Mass of the day” without editorial work.

5. **Third-party scrapers (e.g. GitHub `catholic-mass-readings`)**  
   - Still republish USCCB material; same licensing constraints apply.

## Typing game — Universalis JSONP (Today's Bible)

The **Play → Typing → Today's Bible** mode loads **today only** via Universalis’s free [JSONP service for webmasters](https://universalis.com/n-web.htm) ([technical notes](https://universalis.com/n-jsonp.htm)).

| Requirement (Universalis) | How this site complies |
|---------------------------|-------------------------|
| Do not scrape/copy-paste pages | Server fetches official `jsonpmass.js` only |
| Link to Universalis | UI links to `https://universalis.com/…/mass.htm` |
| Keep copyright notice visible | API returns `copyrightNotice`; typing UI shows it under the passage |

Default calendar: `Europe.England` (ICEL / ESV-CE texts on Universalis). Override with `UNIVERSALIS_CALENDAR_PATH` (same path segment as in the JSONP URL).

**Not the same as USCCB:** Universalis texts follow the calendar/translation configured on Universalis (e.g. England), not the U.S. Lectionary on bible.usccb.org. Mass hub (`/mass`) uses USCCB + Living with Christ **links only**.

| File | Role |
|------|------|
| `src/lib/universalis.ts` | Fetch & parse JSONP → typing `MassReading[]` |
| `src/app/api/universalis-readings/[date]/route.ts` | Today-only API for typing |

## Implementation in this repo

| File | Role |
|------|------|
| `src/lib/usccb-rss.ts` | Parse USCCB RSS (used by `fetchMassDay` / API, not public `/mass` HTML) |
| `src/lib/mass-source.ts` | `fetchMassDay`, calendar summaries, footer attribution |
| `src/lib/evangelizo.ts` | Calendar titles; optional republish when env flag set |
| `src/lib/scripture-links.ts` | Living with Christ outbound URLs |
| `src/lib/living-with-christ.ts` | Legacy fetch helpers (not used on live `/mass` UI) |

### Environment

```env
# Default: false — do not republish full Evangelizo text on-site
MASS_REPUBLISH_EVANGELIZO=false
```

Set to `true` only if you have obtained appropriate USCCB/CCD (and Evangelizo, if required) permissions.

### Site disclaimer

Mass pages are **not** an official USCCB or parish missal. Typing **Today’s Bible** shows on-site text for practice; `/mass` sends users to publisher sites for official U.S. texts.

## Next steps for operators

1. Keep `MASS_REPUBLISH_EVANGELIZO` **off** in production unless licensed.  
2. Point catechists to **USCCB** or **Living with Christ** from `/mass` for official reading texts.  
3. Do not promise USCCB-identical texts in Typing mode (Universalis calendar).  
4. For full-month on-site U.S. lectionary text, request a **USCCB digital license** (CCD Permissions, 202-541-3098).

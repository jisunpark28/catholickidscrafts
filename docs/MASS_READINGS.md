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

## Official sources — Vatican, bishops’ conferences, dioceses (한국어)

바티칸·각국 주교회의·교구가 제공하는 자료 중 **이 사이트에 적합한 것**만 정리합니다. “공개 도메인” 미사 전문 API는 **없습니다**. 대부분 **저작권(CCD, 주교회의, 출판사)** 이 있으며, **명시적 허가·RSS·위젯** 경로만 사용합니다.

| 출처 | URL | 사이트에 본문 표시 | 비고 |
|------|-----|-------------------|------|
| **바티칸 (Holy See)** | [vatican.va](https://www.vatican.va/) | **아니오** (일일 복음 피드 없음) | 교리·전례 규범 문서. 일일 독서 syndication API 없음 |
| **Vatican News 위젯** | [vaticannews.va/widget/embed.html](https://www.vaticannews.va/widget/embed.html) | 위젯 = **교황·교회 뉴스** | 일일 복음 텍스트 아님. 교구 파트너용 embed |
| **USCCB (미국 주교회의)** | [bible.usccb.org](https://bible.usccb.org/) · RSS: [readings.rss](https://bible.usccb.org/readings.rss) | **RSS로만** 무료 비유료 사이트 표시 허가 ([RSS 안내](https://www.usccb.org/subscribe/rss)) | 미국 전례집 공식 영문. HTML 스크래핑·앱 배포는 별도 CCD 허가 |
| **CBCK (한국천주교주교회의)** | [missa.cbck.or.kr](https://missa.cbck.or.kr/) | **링크만** (전재는 서면 승인) | RSS/공개 API 없음. 스크래핑·봇 금지 ([저작권](https://www.cbck.or.kr/Copyright), mano@cbck.or.kr) |
| **Universalis JSONP** | [n-web.htm](https://universalis.com/n-web.htm) | **오늘** 타이핑용 (약관 준수) | US 전례와 역본·달력이 다를 수 있음 |
| **Evangelizo** | feed.evangelizo.org | 기본 **제목만** | 전문 재게시는 USCCB/CCD 책임 (`MASS_REPUBLISH_EVANGELIZO=off`) |

### 권장 운영 (미국 중심 사이트 + 한국 확장 대비)

1. **`/mass`**: Evangelizo 전례일 제목 + **USCCB·Living with Christ 외부 링크** (현재 방식 유지).
2. **`/bible/gospel` 타이핑**: **Universalis JSONP** (웹마스터 약관) 또는 CCD 확인 후 **USCCB RSS** (미국 공식 전례와 동일 텍스트 필요 시).
3. **한국어**: [missa.cbck.or.kr](https://missa.cbck.or.kr/) **링크** + 주교회의 **저작권 사용 승인** 신청 후에만 on-site 한국어 본문.
4. **바티칸**: 일일 복음 데이터 소스로 사용하지 않음. 필요 시 Vatican News **위젯**만 별도 페이지에 embed 검토.
5. **교구 RSS/위젯**: 대부분 뉴스·공지용. 미사 전문은 **소속 주교회의(USCCB/CBCK 등)** 공식 채널 우선.

코드: `src/lib/official-reading-sources.ts`, UI: `OfficialReadingLinks` on `/bible/gospel`.

### USCCB RSS vs 타이핑 게임 (법무 회색지대)

USCCB는 “**RSS를 통한** 일일 독서를 **웹사이트에** 표시”는 허가·요금 없이 허용합니다. 다만 “**디지털 애플리케이션**(유·무료)”은 **CCD 라이선스** 필요 ([Bible Permissions](https://www.usccb.org/offices/new-american-bible/permissions)).  
인터랙티브 **타이핑 연습**이 “앱”에 해당하는지 불명확하면 **CCD (202-541-3098)** 에 확인 후 USCCB RSS on-site 사용을 결정하세요.

### CBCK (한국) — 라이선스 절차

- 담당: 한국천주교중앙협의회 총무부 · 02-460-7552 · mano@cbck.or.kr  
- 신청서: [주교회의 서식 > 저작권](https://www.cbck.or.kr/Board/K7300)  
- 승인 전: **missa.cbck.or.kr 링크만** (영문은 CBCK 사이트가 USCCB로 연결하는 패턴과 동일).

## Official sources — Vatican, bishops’ conferences, dioceses (English)

See table above. **No Vatican daily-Gospel open API.** **USCCB RSS** is the only major bishops’ conference feed with explicit free **website** republication terms for full lectionary text. **CBCK** is official for Korea but **license-only** (no RSS). **Vatican News widget** is for news embeds, not readings.


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

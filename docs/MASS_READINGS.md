# Daily Mass readings — sources and compliance

Operator reference for **catholickidscrafts.com** `/mass` pages.

## Summary (한국어)

| 방식 | 저작권·합법성 | 사이트 동작 |
|------|----------------|-------------|
| **USCCB RSS** (`bible.usccb.org/readings.rss`) | USCCB: 무료·비유료 사이트에서 RSS로 제공되는 일일 복음서전문 표시 허용 ([RSS 구독 안내](https://www.usccb.org/subscribe/rss)) | **기본**: RSS에 포함된 날짜(약 10일)는 본문 전문 표시 + CCD 저작권 문구 |
| **USCCB 공식 페이지 링크** | 본문 재게시 없음 | RSS 밖 날짜: 제목·인용만(Evangelizo) + “Read on USCCB” 버튼 |
| **Evangelizo API 전문 재게시** | USCCB/CCD 저작권 — **서면 허가 없이는 위험** | `MASS_REPUBLISH_EVANGELIZO=true` 일 때만 (운영자 책임) |

이 저장소는 기본적으로 Evangelizo로 **전문을 다시 올리지 않습니다.** 달력 제목·성인 기념 등 메타데이터와 인용에 Evangelizo를 쓰고, 본문은 USCCB RSS 또는 USCCB 링크로 처리합니다.

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

## Implementation in this repo

| File | Role |
|------|------|
| `src/lib/usccb-rss.ts` | Parse USCCB RSS → `MassReading[]` |
| `src/lib/mass-source.ts` | `fetchMassDay`: USCCB first, link-only fallback |
| `src/lib/evangelizo.ts` | Calendar titles, citations, optional republish flag |

### Environment

```env
# Default: false — do not republish full Evangelizo text on-site
MASS_REPUBLISH_EVANGELIZO=false
```

Set to `true` only if you have obtained appropriate USCCB/CCD (and Evangelizo, if required) permissions.

### Site disclaimer

Mass pages are **not** an official USCCB or parish missal. Typing games need on-site text; dates outside the RSS window show citations + USCCB link until RSS includes that day.

## Next steps for operators

1. Keep `MASS_REPUBLISH_EVANGELIZO` **off** in production.  
2. For dates beyond the RSS window, users use the USCCB button (expected).  
3. For full-month on-site text, request a **USCCB digital license** (CCD Permissions, 202-541-3098).  
4. Display USCCB copyright notice whenever RSS text is shown (handled on `/mass/[date]`).

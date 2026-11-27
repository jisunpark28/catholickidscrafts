# Catholic Kids Crafts — Content Production Constitution

**Scope:** every worksheet, card, illustration, and social post made for www.catholickidscrafts.com
**Status:** v1.1, 2026-11-25 (America/Toronto)
**Owner:** Jisun Park. Only Jisun can approve changes to this document.
**Audience:** any AI bot or person who creates content for the site. Read it in full before your first task, and run the checklists in Article 14 before you hand anything over.
**Copyright, attribution and doctrinal accuracy** are governed by `docs/legal/COPYRIGHT_AND_DOCTRINE_CONSTITUTION.md`, which takes precedence on those topics.

> **How to read this document.** "MUST" and "NEVER" are hard rules. "SHOULD" is the default unless Jisun says otherwise. Items marked **⚠ NEEDS CONFIRMATION** are open conflicts or gaps. Do not guess on those: follow the interim rule given, and ask Jisun when the item matters for your task. All of them are listed in Article 16.

---

## Contents

1. Purpose, scope and precedence
2. Faith and doctrine
3. Official sources and text versions
4. Copyright and attribution
5. Language, tone and copy
6. Access, gating and locking
7. Design system: brand tokens
8. Design: worksheets (printables)
9. Design: cards
10. Design: illustrations and characters
11. Design: prayer carousel and page surfaces
12. Design: Instagram and Pinterest
13. Production workflow and repository rules
14. Pre-publish checklists
15. Reference files
16. Open items (⚠ NEEDS CONFIRMATION)
17. Change log

---

## Article 1. Purpose, scope and precedence

1.1 **Purpose.** This document gathers every content and design rule Jisun has set for the site. Any bot that follows it should produce work Jisun can publish without having to correct a known rule.

1.2 **Scope.** It covers:
- Sunday sheets (Level 1 and Level 2).
- Activity worksheets (daily, seasonal and prayer worksheets, and the Saint Report Worksheet).
- Crafts.
- Picture cards (saints, Mary, feasts, prayer, Bible, virtue, Mass, sacraments, fun, Masterpiece).
- Q&A (liturgy) cards and prayer cards.
- Prayer-carousel phrase art.
- Faith Journal questions.
- Instagram and Pinterest posts.

1.3 **Precedence, highest first.**
1. A newer direct instruction from Jisun in the current conversation. Follow it, then propose an update to this document. A newer instruction beats an older one, and an older one stays in force until a newer one replaces it.
2. This constitution.
3. Approved plans and specs in the repo (`docs/*.md`) and on the box (Article 15).
4. Existing live content. When a rule is silent, match what is already published.

1.4 **When in doubt.**
- Do not invent facts, sources, saint details, or design tokens.
- Leave a field empty rather than guess (see 2.6), and mark it ⚠ NEEDS CONFIRMATION.
- Ask Jisun, in Korean.

1.5 **Exactness.** Follow Jisun's specs exactly, with no extra work. When she gives menus, outlines, names, orders or URLs, reproduce them exactly as given; do not reinterpret them.

1.6 **Mockup first.** For any new feature or new visual format, show Jisun a mockup before you implement it. Put labels such as "BEFORE" or "AFTER (proposal)" in the margin outside the mockup, so she cannot mistake them for site buttons.

---

## Article 2. Faith and doctrine

2.1 **Official teaching only.** Every statement MUST be official Catholic teaching or a verified fact from an approved source (Article 3). Never add opinions, speculation, or popular piety presented as doctrine.

2.2 **No legends.**
- Never use a legend or a pious tradition that is not in Scripture or official teaching, even when it is labelled "a story" or "tradition".
- Examples that are banned:
  - St. Francis and the wolf.
  - Veronica's veil.
  - St. Patrick's shamrock lesson.
  - St. Cecilia's organ.
  - St. Christopher carrying the Child.
  - St. Nicholas's gold coins.
  - St. Lucy's eyes.
  - St. Jerome's lion.
  - St. Dominic's torch-dog and the rosary-origin story.
  - St. Elizabeth's bread turning into roses.
  - St. Clare repelling an army with the Eucharist.
  - St. Simon Stock's scapular vision.
  - The Edessa image of Jesus.
  - The "Dismas" name for the Good Thief.
  - The Presentation of Mary story (it comes from tradition, not Scripture).
  - The Helena "True Cross discovery" narrative.
- The Peace Prayer is not by St. Francis (it is anonymous, early 1900s). Do not attribute it to him. Use the Canticle of the Creatures instead when a Francis text is needed.
- Use Scripture's Stations of the Cross (St. John Paul II, 1991) rather than the traditional set, which includes non-biblical stations.

2.3 **No violence and nothing scary.**
- Never show any of these:
  - Martyrdom scenes, executions, blood, wounds, whips, soldiers attacking, weapons in use.
  - Fire danger, devils shown as scary, skeletons, bodies in tombs.
  - Grenades, barbed wire, or war imagery.
- Express hard concepts (evil, hell, devil, death, punishment, sin) only through symbols:
  - a fading shadow, light, a shepherd, a sunset path, untangling a net;
  - a photo and a candle for someone who has died;
  - a soft glowing heart for the Sacred Heart (no thorns or wounds);
  - an empty cross with a glowing heart instead of a corpus where needed.
- Martyrs hold a palm branch. An instrument of martyrdom may appear only as a small emblem, never in use.
- A crucifix, when shown, has a peaceful corpus with no blood or emphasized wounds.
- St. Michael is shown only as a protecting angel (shield of light, scales, a sword of light pointed down). Never show a fight.
- Real fire in crafts is forbidden. Use paper flames or LED only.
- Remove the dropped or fixed crafts listed in `/workspace/plan/ckc-crafts-activity-plan.md` §6. The two Magi Plus crafts (`epiphany-chalk-blessing`, `magi-finger-puppets`) are approved exceptions.

2.4 **No ages or grades.**
- Never print an age, an age range, or a school grade on site copy, titles, meta descriptions, sheets, cards or posts.
- Use level names only:
  - Sunday sheets: **Level 1 / Level 2**.
  - Prayer worksheets and activities: **Little / Growing / Ready**.
- Internal prompts may mention child proportions; site-facing text may not.

2.5 **Softened official wording.** Use the Church's own expressions. For example, "Ten Commandments" uses the official catechetical formula, including the official wording of the 6th and 9th commandments. Soften the tone, never the content.

2.6 **Saint facts.**
- Use only facts confirmed by approved sources: Vatican / Vatican News, Franciscan Media, christianiconography.info, USCCB.
- If patron or symbols cannot be confirmed, leave the field empty and hide its badge. Never fill a gap from memory.
- Keep each card's original one-line wording. The confirmed one-line story goes only in the Fact Box.

2.7 **Purity / chastity.** For children, chastity appears only as **Purity of heart**: eyes, words, clothes, a clean heart (CCC 2518, 2521–2522; Matthew 5:8). No sexual teaching, no dating scenarios, no Genesis 39.

2.8 **Faith Journal.**
- Questions are original, easy, paraphrased questions. Never quote Gospel or Lectionary text verbatim.
- Reference the Gospel by citation only.
- Each date gets 3 questions and a `lookFor` line.
- Short Order-of-Mass responses (for example "Lord, have mercy") are the only quotes allowed.

2.9 **Catechism-based content.**
- Q&A and liturgy answers are kid-level, rewritten originally, and based on the CCC and its Compendium.
- Do not show CCC or Compendium numbers on the pages. Keep source references in planning documents and the admin-only fields. The same rule covers GIRM numbers and translation credits (see 5.11).
- Custom (catechism) sheets reference only the Catechism of the Catholic Church.

---

## Article 3. Official sources and text versions

| Content | Source (use verbatim) | Notes |
|---|---|---|
| Scripture on cards, carousels, plans | **NABRE** (bible.usccb.org) | Quote short and exact, including capitalization and punctuation. A verse that continues a sentence keeps its lowercase start and conjunction; say so rather than recapitalizing. Keep NABRE brackets in editor notes. NABRE wording wins over older English (e.g. "clean of heart"). Individual verses only, never a whole translation; no attribution beside the verse (owner decision 2026-11-25). |
| Daily readings shown or typed on the site | **Universalis only** | Never show or type USCCB reading text; USCCB *links* are fine. Do not fetch Universalis on the server. |
| Bible typing / Bible read pages | Public-domain Douay-Rheims, modernized (`modernize-for-reading.ts`, Gospel overrides) | Never mention "Douay" to users (no numbering notes, footnotes or meta); the only exception is the Sources & copyright page (`/sources`). Chapter and verse numbers follow official Catholic numbering. |
| Traditional prayers | USCCB prayer pages (usccb.org/prayers/…), then USCCA (2006) Appendix B, then the Compendium of the CCC (2005) Appendix, then the Roman Missal (ICEL 2010 / USCCB 2011) | Keep thee/thou only where the official text has it. Common prayers are used as-is and need no source record (owner decision 2026-11-25); the `source` field in `src/data/prayers/prayer-phrases.json` is optional and internal, never displayed. |
| Act of Contrition | USCCB version (usccb.org/prayers/act-contrition, Order of Penance first form) | Jisun's decision, 2026-11-19. |
| Confiteor | Roman Missal 2011 (Penitential Act, form A): "…that I have greatly sinned… through my fault, through my fault, through my most grievous fault…" | The 1973 text is retired. |
| Apostles' Creed | USCCB: "…he descended into hell…" | The old ICEL "descended to the dead" is retired. |
| Mass texts (Gloria, Creed, Sanctus, Agnus Dei, dialogues) | ICEL Roman Missal 2010 | Short quotes only. |
| Ten Commandments | Traditional catechetical formula printed in the CCC (before ¶2052) | |
| Unsourced prayers (St. Francis Peace Prayer, Holy Water Prayer, Prayer After Communion) | Current site text | Keep them as common prayers; no source record or label is needed (owner decision 2026-11-25). Never attribute the Peace Prayer to St. Francis. |
| Liturgical calendar / Gospel citations for the Faith Journal | USCCB daily readings pages (US calendar and transfers) | Citation format is the USCCB link text, e.g. "Luke 14:1, 7-11". Store one citation per date (no "A or B"). |
| Saint facts | Vatican / Vatican News, Franciscan Media, christianiconography.info, USCCB | See 2.6. |
| Liturgical-season questions | CCC and Compendium, rewritten for kids | See 2.9. |
| Korean CCC (CBCK / maria.catholic.or.kr) | **Never store, process or show its text.** | CBCK rules (Article 8) ban use in for-profit AI services or apps. Cite paragraph numbers with links only, or get CBCK permission (mano@cbck.or.kr). |

3.1 **New kids' prayers** written for the site are allowed on cards. Mark them as new in the notes, and never present them as traditional prayers.

3.2 ⚠ **NEEDS CONFIRMATION (O-1).** An older rule (2026-10-21) took English prayer-card texts verbatim from a maria.catholic.or.kr page. The newer decisions (2026-10-29 cards plan; 2026-11-19 /prayers) use USCCB, ICEL and the Missal. Interim rule: use the USCCB, ICEL and Missal sources above.

---

## Article 4. Copyright and attribution

4.1 **One Sources & copyright page.** All sources, credits, copyright and license statements live only on the Sources & copyright page (`/sources`), linked from the footer. Never add a source, credit or copyright line to cards, card images, worksheets, prints, prayers, Scripture verses, images or other pages. Common prayers and individual verses need no record (owner decision 2026-11-25). The "Copyright notice" section of `/workspace/cards/master-prompt.md` is superseded by this rule.

4.2 **Prayer carousel.** The carousel shows no source line (see 4.1).

4.3 **Masterpiece cards.**
- Use public-domain artworks only (the artist died more than 70 years ago). Show them whole and unaltered: no crop, recolor, filter, AI edit, stickers, or overlap.
- Never feed a painting to an image model.
- Excluded: the Divine Mercy image (Kazimirowski, 1934; in copyright until 2035).

4.4 **Never copy** an existing artist, studio, franchise, or known Catholic illustration. Reference posts (for example @catholic_archive, kim.thanks) are used only for structure and composition, never traced or imitated.

4.5 **Protecting images.**
- Images on the site block right-click and drag-to-save.
- Free visitors receive only small, blurred, greyscale locked previews. Original print files are blocked server-side.

4.6 **Admin-only.** Source URLs for prayer cards, review notes and Compendium numbers stay admin-only.

4.7 **AI illustrations.** Illustrations (cards, thumbnails, previews, prayer art, printables) are made with AI image-generation tools (Article 10.10). This is disclosed once, on the Sources & copyright page; never label individual images or items (owner decision 2026-11-25).

---

## Article 5. Language, tone and copy

5.1 **Site content language.** All site-facing content is **English**.

5.2 **Talking to Jisun.** Jisun writes in Korean. Reply and report to her in Korean, including after every social post (give the link). Site labels can stay in English inside Korean reports.

5.3 **Tone.**
- Warm, simple, natural sentences, like a mom or teacher casually offering something to a friend.
- Friendly but not over the top. As little text as possible.
- No hype, no added exclamation marks.

5.4 **No prompt-like or meta lines.**
- Never write descriptive "what this post contains" lines. Bad: "A question, a simple activity, and today's saint card." Good: "A little way to start the new Church year together."
- Never write helper text such as "Always free", "No sign-in", "Swipe →".

5.5 **No "free" tags.** Never write "Free", "Free with sign-in" or similar labels on resources (see Article 6). On the site, remove "Free. No sign-in. One letter-size page."-style lines.

5.6 **No year numbers in kid-facing copy.** Kid-facing carousel and card copy ships with no four-digit calendar year (per `docs/virtues-plan.md`).

5.7 **Spelling.**
- The site and its activity catalog use British/Canadian spelling: "colour", "Saviour".
- Prayer and Scripture texts keep their official spelling exactly.
- ⚠ NEEDS CONFIRMATION (O-8): Faith Journal entries and some UI copy use American spelling ("color").

5.8 **SEO copy.**
- `seoTitle` leads with real search terms. The meta `description` is about 150 characters.
- Do not show age or grade text.
- Do not add FAQPage schema. Do not add a blog or a new page hierarchy.
- Use compact unique fact boxes rather than long articles.

5.9 **Saint and card pages.**
- Indexed saint pages use a short "… for Kids" title and a meta description (feast day, story, printable card) that does not truncate in search results.
- Pages without a unique Fact Box are `noindex,follow` and stay out of the sitemap.

5.10 **No repeated wording.** Never repeat the same sentence in both a quote box and a description on one page.

5.11 **No citation numbers or translation credits in user-facing text.** Do not show CCC numbers, GIRM numbers, “Official source line,” or a translation name. Check teaching against the CCC and the GIRM, and record those numbers only in `docs/legal/sources.md`. A verse on a page is public-domain English or our own kid-friendly modern English, with only the reference, such as Mark 16:15. A public-domain quotation still needs `sources.md` and `verified: true` set by the owner before it is displayed. Our own kid English is an explanation. Do not present it as a translation. Existing Bible reading, Daily Mass typing, Sunday sheets, and card verses stay as they are.

5.12 **No prompt or meta lines in the UI.** Never show a sentence that describes the prompt or a guardrail, such as “There is no price on this page.”, “Official source line:”, or “not a sentence of the Catechism.”

5.13 **Concise and scannable.** Use short sentences, short bullets, and clear subheads. Do not repeat the same point in the next section. Split a dense paragraph of three lines or more into a list. Use natural modern English. Article 5.8 still forbids age or grade text.

5.14 **No school grade labels.** Do not write Grades K–2, 3–5, or 1–5 in body copy, cards, FAQ, or metadata. Use Level 1 and Level 2. If an explanation is needed, say younger children or older children.

5.15 **No country or region wording in body copy.** Do not write “In the United States,” “U.S.,” or “American.” Phrase a local liturgical custom universally, for example “following our parish custom.”

## Print worksheet readability rules

These rules apply to Catholic Mass worksheets at `/print/evergreen` (Level 1 and Level 2). Sunday sheets, virtue sheets, and the sheet editor keep their existing styles. A future Concluding Rites sheet uses the same Mass layout when it is added. Do not invent that sheet until it exists.

1. The title appears once, top left. Top right is only “Name: ____”, Level 1 or Level 2, and the Scripture reference.
2. No 2px black borders. Use 1px solid `#888`, card padding 12–16px, and section gaps 14–16px. The sheet fills one US Letter page, with no large empty area at the bottom.
3. “Today’s Story” is 11–12pt with line-height at least 1.55. If it runs past three lines, split it into two short paragraphs. No text anywhere on the sheet is under 9pt.
4. Every line a child writes on is 28–34px tall and does not overlap a border or an option. Level 1 “Trace the words” uses a three-line guide: solid, dashed, solid. Instructions say “circles” or “boxes” only when that is the shape on the page.
5. The print body has no underlined web link. The Level 2 answer key is one short line at the very bottom, just above the footer, turned 180 degrees.
6. Do not print a floating row of altar, cross, and book icons.

---

## Article 6. Access, gating and locking

6.1 **The master rule (Jisun, 2026-11-19).**
- All activity worksheets and crafts are **Plus-only**.
- The only exception: a worksheet scheduled for the **current week** is free to **signed-in** users.
- Never make a new worksheet free-with-sign-in by default; this includes the Saint Report Worksheet.
- Prayer worksheets are always Plus and never enter the weekly schedule.

6.2 **Week definition.**
- Weeks run **Monday to Sunday** (`weekSundayOf` in `src/lib/resource/week.ts`).
- The free week is computed in **America/Toronto**.
- `isActivityFreeInWeekOf(activity, ymd)` is true when the activity is the day's activity on some day of that week (`dailyActivityFor` / `recurringActivitySlug`).
- Catalog field `access`:
  - `"signin"`: Plus, except in its scheduled week, when it is free with sign-in.
  - `"plus"`: always Plus.
- The download API checks access on every request.

6.3 **Sunday sheets.**
- Only this week's sheet is printable by free users.
- Other weeks can be viewed but not large.
- Ctrl+P on a locked sheet prints only a "Plus members only" notice.
- The /resource Weekly Sheet switches automatically every Monday.

6.4 **Sign-in for Print and Download.** Print and Download on the homepage, Sunday sheet detail and the Printables list require sign-in. Signed-out users go to Sign in and come back to the same page. Direct file URLs must not bypass this.

6.5 **Locked behaviour.**
- Locked cards (signed out, or not Plus) are not clickable. The image and the Open, Print and Share buttons do nothing; only the "Get Plus" link works.
- A direct `?card=` URL must not reveal the card.
- Pinned sheets and cards still lock after their week.
- No notice boxes on the page. The "Unlock with Plus" box for free users stays.
- Locked tiles show a grey overlay, a lock mark and a blurred greyscale preview.
- Plus members and this week's free item stay viewable.

6.6 **Cards.**
- Downloads are PNG only, in fixed 4:5 format.
- Download and Share are Plus-only, checked server-side.
- Thumbs are public; full originals are private (Vercel Blob).

6.7 **Open to everyone.**
- The /prayers carousel and its on-screen activities.
- Faith Journal questions (saving: 4 free entries, then Plus).
- Q&A cards.
- Weekly admin content (`/admin/weekly`). ⚠ O-7.

6.8 **Plus editor.**
- Editable worksheets (`editable: true`) have an element model; Plus members can edit every line, dot, letter and shape.
- Customize opens to everyone as a trial. Saving, printing and photo upload are Plus, enforced server-side.

6.9 **Plus status.** It comes only from the signed-in family account: its Stripe/PlusPass, or its Google email listed in `PAID_PREVIEW_EMAILS`. Admin login, browser state, cache and cookies must never affect it.

6.10 **Printables searchability.** Every worksheet (including all prayer worksheets) MUST appear in /resource (Printables) search, with keywords. All sheet pages stay in the sitemap.

6.11 **Google Classroom share.**
- Put it only on no-login pages: /play, daily Mass, saints, Mass explanation, Q&A, and each prayer's full-screen view (`?prayer=<slug>`). Never on login-required worksheet pages.
- Hide it in Kids Mode and in print.
- Use a plain `<a target="_blank" rel="noopener noreferrer">`, not `window.open()`.
- The shared URL keeps the allowed query (`prayer`, `level`).

---

## Article 7. Design system: brand tokens

7.1 **Overall look.**
- A cream background, an orange/brown palette, and a cute picture-book illustration style.
- Calm, warm, collectible, "save-worthy".
- **Never** use real photos, dark or black backgrounds, neon colours, old clip art, or stock imagery.

7.2 **Site colours** (repo `src/app/globals.css` `@theme`).

| Token | Hex | Use |
|---|---|---|
| `--color-accent` | `#d35400` | Brand orange: primary buttons, focus rings, badges, action tags |
| `--color-accent-hover` | `#b8470a` | Hover |
| `--color-cream` | `#fff3e6` | Cream surfaces |
| `--color-ink` | `#1f2937` | Body text (site) |
| `--color-muted` | `#6b7280` | Secondary text |
| `--color-border` | `#e5e7eb` | Borders |
| `--color-surface` | `#f9f9f9` | Panels |
| `--color-page` | `#ffffff` | Page |
| `--color-link` | `#335599` | Links in prose |

7.3 **Prayer carousel colours** (`src/styles/prayer-carousel.css`, `.pcx`).

| Token | Hex |
|---|---|
| cream | `#FFFDF9` |
| paper | `#FFF7EA` |
| ink | `#3b2a1f` |
| brown | `#493a30` |
| line | `#d8c6b4` |
| orange | `#d35400` |
| orange-l | `#fbe3d0` |
| ok | `#4f7d5c` |
| bad | `#b4472f` |
| picture frame border | `#f0e2cf` |
| dots | `#ead9c6`, done `#e8b48a`, current = orange |

7.4 **Card colours** (measured painted set, `docs/virtues-plan.md` §4.2).

| Element | Value |
|---|---|
| Page / corners | `#fef9f6` |
| Badge pill fill | about `#d45400`, white label |
| Illustration well stroke | about `#e1dbcd` |
| Scene ground | often `#fff5e1` / `#fdf7e5` |
| Footer text | about `#a8a29b` |

The evergreen vector faces (VIR-054–077, MAS-066–069) use cream `#fcf8f1`.

7.5 **Illustration palette** ("Little Light" master prompt, `/workspace/cards/master-prompt.md`).
- Cream `#fdfaf7`; warm paper beige `#f3e9dc`; accent orange `#d35400` (one focal accent, sparingly).
- Peach `#f6c9a8`; butter yellow `#f9e3a1`; halo gold `#e8c26a`; mint `#bfe3d0`; sage `#9cc5a1`; sky `#bcd9f0`; Marian blue `#8fb3d9`; lavender `#cdbfe6`; blush `#f4c2c2`; rose `#e8a0a8`.
- Line brown `#4a3b32`. Holy glow `#fff1c9`.
- Liturgical pastels: violet `#b9a3d6`, rose `#f2b8c6`, white/gold `#fffaf0` + `#e8c26a`, red `#e57b6f`, green `#9cc5a1`.

7.6 **Prayer phrase art background.** Measured cream is about `#FFF3DD` (RGB 255, 243, 221) at the corners.

7.7 **Worksheet print colours** (ReportLab, `scripts/activities/daily/kit.py`).
- Ink `Color(0.08,0.08,0.08)`, muted `0.30` grey, soft rule `0.6` grey.
- Colour-version fills (0–1 RGB):
  - violet (0.78,0.70,0.86); deep violet (0.62,0.50,0.75); rose (0.97,0.76,0.84);
  - gold (0.98,0.91,0.62); flame (1.0,0.82,0.42); green (0.72,0.85,0.70); dark green (0.55,0.74,0.55);
  - brown (0.86,0.73,0.58); straw (0.97,0.88,0.58); sky (0.80,0.89,0.97); night (0.66,0.72,0.88);
  - red (0.96,0.70,0.68); cream (1.0,0.97,0.90); blue (0.70,0.82,0.95); grey (0.88,0.88,0.88).
- B&W versions use white fills.

7.8 **Liturgical colours in content.** Violet: Advent and Lent. Rose: Gaudete and Laetare. White/gold: Christmas, Easter and feasts. Red: martyrs, Pentecost, Palm Sunday, Good Friday. Green: Ordinary Time.

7.9 **Typography.**

| Surface | Fonts |
|---|---|
| Site body | Inter (`--font-inter`) |
| Kid UI titles (Q&A cards, carousel text, modes) | Fredoka (`--font-fredoka`), fallback Baloo 2 |
| Prayer carousel titles | Georgia, serif, bold, brown |
| Worksheets (PDF) | **Baloo 2** (Regular/Bold) for titles, kickers, numbers and word chips; **Comic Relief** (Regular/Bold) for body, questions and write-in labels. Files are in `public/fonts/activities/`. |
| Card title and caption | Heavy rounded sans matched to the painted set (pick among Nunito, Fredoka and Baloo 2 by matching a crop of BIB-031, and record the choice). Never Trebuchet or Arial. |
| Card text overlays in general (master prompt) | Fredoka for titles; Inter or Nunito for body |
| Instagram | Fraunces (variable, wt 500, softness 40–50, wonky 0) for headlines and answers; Source Sans 3 (wt 500) for kickers and footer |

7.10 **Emoji and icons.**
- Site UI may use the existing emoji conventions (🖨 Print, 💬 Feedback, ✝ section badge, the level icons 🌱 Little, ⭐ Growing, 🕊️ Ready, 🔖 in the Instagram caption opener).
- Never put emoji inside illustrations or printable sheets.
- Instagram slides use no emoji.
- Draw the Host and chalice; never use 🍞🍷.
- Action cues in the prayer carousel are a small orange ✙ tag.

7.11 **Logo.** Use Jisun's own sheep logo exactly as given: no recolouring or reshaping, and never redraw it.

---

## Article 8. Design: worksheets (printables)

8.1 **Page and format.**
- **US Letter** (8.5×11 in; 612×792 pt; editor coordinates 816×1056 px at 96 px/in), portrait, one page per sheet. Long prayers split into parts ("Part 1 of 2").
- Every worksheet ships in **two versions**: **B&W** (coloring, `<slug>.pdf`) and **colour** (`<slug>-color.pdf`). Colour versions change fills only, never shapes, so both share one editor model.
- Margins: `MARGIN = 36 pt` (0.5 in). Content safe area `SAFE = 44 pt` (40 pt on the Church-year wheel). Keep all text and shapes inside the safe area.
- Default stroke 2.0 pt, round caps and joins. Frames are rounded rectangles (radius about 10–14 pt, stroke 1.1–1.6 pt). Dotted write-in lines are 1.1 pt, dash 1/3. Cut lines are dashed, muted, 1.0 pt, with a scissors icon.

8.2 **Page furniture** (`kit.py`).
- **Header:**
  - Kicker in uppercase, Baloo 10 pt, muted, centred (for example "ADVENT ACTIVITY").
  - Title in Baloo Bold 30 pt, centred, shrinking to fit (minimum 20 pt; 15 pt for prayer sheets).
  - An optional question in Comic Relief Bold 12.5 pt, then a short answer in Comic Relief 10.5 pt, muted, centred.
- **Footer:** a thin soft rule across the page and "catholickidscrafts.com" in Comic Relief 9 pt, muted, centred, at the bottom margin.
- **Body text:** Comic Relief 11–12 pt, leading about 1.3×.
- **Decorations** come from the kit's drawn shapes only: star, heart, flower, rose, leaf, candle, flame, cross, cloud, moon, smiley.
- Draw everything as plain vector marks (lines, rects, circles, paths, strings). Each mark becomes one editable element, and every mark belongs to a named `group(...)` (for example "Title", "Footer", "Line 3: number").

8.3 **Sunday sheets.**
- One sheet per Sunday or solemnity, keyed to the liturgical calendar (Years A, B and C plus solemnities). There are no calendar dates on the sheet.
- Based on that Sunday's Gospel.
- Sections:
  - Gospel reference and verse
  - Today's Story
  - Words
  - Activity
  - Let's Talk
  - This week I will
- Two levels, **Level 1 and Level 2**, on one page. The coloring and activity areas are merged into one activity area per level.
- The activity section MUST differ every week and fit that Gospel; choose it from an activity-template library per week and level. It must not always be the heart activity.
- Data lives in `src/data/sunday-sheets/*.json` (one file per week holding L1 and L2). Editor bases are in `public/sheet-bases/{slug}-l{1|2}.png/.json`.
- The sheet detail page shows the sheet's existing Today's Story and Let's Talk in small text under the Print button. Do not write new copy for it. The "About this Sunday's Gospel" box and the previous/next links are hidden on screen only.

8.4 **Activity worksheets** (daily, seasonal, Advent, etc.).
- Header with kicker, title, the matching Q&A question and the site's short answer; then the activity; then the footer.
- Each ties to a Q&A card "Try this" line (`tryThis`, exact wording).
- New activity worksheets use the editable bundle format (`storage: "bundle"`, `editable: true`).

8.5 **Prayer worksheets** (`scripts/activities/prayers/`).
- Data source: `src/data/prayers/prayer-phrases.json`, the same data as the carousel. Never retype prayer text.
- Three levels:

| Level | Instruction line | Body |
|---|---|---|
| Little | "Circle the missing word in each line." | Each line has one blank and three word options to circle (Baloo Bold chips) |
| Growing | "Fill in the missing words. Use the word bank." | Lines with blanks and a word-bank frame (sky fill in colour) |
| Ready | "Read each clue and write the line of the prayer." | A clue per line and write-in lines; a "Hints (first letters):" box at the bottom (cream fill in colour) |

- Numbered gold badges per line. The closing line is "Then pray the whole prayer slowly." (Little and Growing).
- Title pattern: `<Prayer>: <Level> Worksheet[ (Part n of m)]`. Kind: "Prayer worksheet". `access: "plus"`.

8.6 **Crafts.**
- Ready-made artwork PDFs, US Letter, colour and coloring versions. Stored in private Vercel Blob (`storage: "blob"`, not in the repo). `editable: false`.
- Title and summary come from the PDF's own first page.
- **Dimensions are critical.** Compression must never change page size, pixel dimensions, placement or ppi. Do not downsample or use Ghostscript `/printer`. Leave B&W coloring PDFs uncompressed.

8.7 **Previews.**
- Every worksheet has two public, low-resolution previews: `public/images/activities/<slug>/preview-bw.webp` and `preview-color.webp`.
- Size 600×776 WebP, quality 82, rendered from the PDF at 110 dpi (`pdftoppm`).
- Card detail pages show a related worksheet preview:
  - Saint cards show the Saint Report Worksheet preview.
  - Other cards show a preview only when a worksheet is linked in the data; otherwise nothing.

8.8 **Watermark.** Every sheet carries "catholickidscrafts.com" in the footer. ⚠ O-9: an older idea (2026-10-21) added a subtle logo and Instagram handle watermark at the bottom of each sheet; it is not in the current kit.

8.9 **Review standard (every sheet, one at a time, even if slow).**
- The words are correct.
- No line or text overlaps or overflows its box.
- Illustrations are centred in their boxes.
- B&W and colour have the same layout.

---

## Article 9. Design: cards

9.1 **Format.**
- Master canvas **1080×1350 px (4:5)**, PNG. This is the only download format; there is no Poster option.
- Square 1:1 (1080×1080) and Letter poster versions, if made, are derived from the 4:5 master by extending the cream background, keeping everything else identical.
- Public thumb: `public/cards/thumbs/<ID>.webp`, 432×540, WebP quality 74 (`npm run cards:thumbs`).
- Locked preview: `public/cards/locked/<ID>.webp`, 216×270, greyscale, blur 3, quality 40.
- Originals stay private (Blob store `catholickidscrafts-blob-cards`, via `originals-manifest.json` / `designed-originals.json`).

9.2 **Painted-card layout** (match the live painted set; measurements from `docs/virtues-plan.md` §4.2).

| Piece | Spec |
|---|---|
| Page | `#fef9f6`, flat; no outer rounded frame around the whole card |
| Badge | Orange pill, top centre, ink y 47–89 (height about 43 px), fill about `#d45400`, white uppercase label (e.g. "BIBLE", "VIRTUE & LIFE", "SAINT · JUN 29"); width grows with the label; fully rounded ends |
| Title | One line, near-black, heavy rounded sans, centred, ink y 123–168 (height about 46) |
| Illustration well | Rounded rectangle, stroke about `#e1dbcd`, top about y 240, bottom about y 999, left stroke about x 90–114; the painting fills the well up to the stroke (near-cream pixels inside under 1%; no inner mat) |
| Caption | Bold, centred, low: one line at about y 1238–1265; two lines at about y 1184 and 1238. No quotation marks painted on. |
| Footer | Card ID at lower left; `catholickidscrafts.com` at lower right; grey about `#a8a29b`, about y 1323 |
| Text | Typeset as real type by a compositor. **Never** ask an image model to draw words. |

9.3 **Catalog row** (`src/data/cards/cards.json`, type `PictureCard`).
- Fields: `id`, `cat`, `set`, `title`, `text` (the caption, stored **without** quotation marks, since the page adds one pair), `prio`, optional `ref`, `when`/`md`/`mdByCountry`, `romcalKeys`, `sheetKeys`, `patron`, `symbols`, `story`, `sources`.
- IDs follow prefixes such as SNT, MAR, FEA, PRY, BIB, VIR, MAS, LIT, FUN, MST. Never reuse an ID, and check the highest existing number first.
- Groups (`?group=`): saints, mary, advent, christmas, lent, easter, virtue, prayer, bible, mass, sacraments, church-year, fun, art. A card may belong to several.

9.4 **Card detail page** (all card types use the saint-card layout).
- Left: a small card image and the buttons.
- Right: title, date, card text, Fact Box.
- One Share button.
- No large centred image. No quote box that repeats the description.
- Non-saint cards show the caption, a short intro and 3 questions.
- Saint Fact Box: Feast Day, Patron of, Symbols, a one-line story. Leave unknown fields empty and hide them.
- In Plus mode the grid shows Open / Print / Share under each card, styled like the sheet buttons. Print prints the original 4:5 image fitted to the page.
- Card copy has no "Format: Instagram portrait 4:5" box and no "PLUS MEMBER" banner.

9.5 **Card content.**
- One clear picture explains one doctrine, feast or story. A "catechism card" is an illustrated card, not a text-sentence card.
- New cards match existing cards in design and format (for example the 12 required-memorial cards).
- Masterpiece cards: the painting is whole on a cream `#fdfaf7` mat with an even margin and a thin beige keyline. Title, short explanation, artist and year, and the NABRE verse sit on the mat. Nothing overlaps the painting.

9.6 **Q&A (liturgy) cards and prayer flip cards.**
- Picture-book style, with big pastel question cards that flip to reveal the answer.
- Fredoka titles. One unified illustration style with a different scene per question.
- Stored in the DB and managed in admin. Drafts publish only when set.
- Long prayer text scrolls inside the card back.
- Short Q&As should also appear in page HTML (e.g. three small cards near the bottom of detail pages).

9.7 ⚠ **NEEDS CONFIRMATION (O-2).** The card illustration *medium* conflicts:
- The 2026-10-29 "Little Light" master prompt specifies flat pastel chibi with clean brown outlines, and says "no watercolor".
- The live painted set, and Jisun's note recorded in `docs/virtues-plan.md` (2026-11), is soft warm watercolor / colored-pencil storybook art that fills the well.
- **Interim rule:** new picture cards MUST match the live painted set (Article 1.3 item 4 and the newer note). Use the master prompt only for its faith, safety and avoid rules.

---

## Article 10. Design: illustrations and characters

10.1 **Style, everywhere.**
- Cute, warm, picture-book illustration on a cream background with an orange/brown palette.
- Soft front daylight. An optional pale-gold glow behind holy figures. Halos are a thin gold ring or a soft gold disc, never a heavy metal plate.
- Joyful, safe, peaceful mood. Gentle sadness only when the story needs it.

10.2 **Composition.**
- One clear focal subject or group. Generous space and a simple background (rounded hills, an arch window, soft clouds, a few sparkles or hearts).
- Keep important elements inside a 6% safe margin. No clutter, no busy patterns, no cropped heads, no tilted horizon.
- Card art reserves an empty top band for title and badge and a calm bottom band for the caption. Master-prompt layouts: top 18% and bottom 12% clear; LONG-TEXT puts the art in the 18–50% band.
- Each character appears **once** per image. Never use triptychs or panels that repeat the same child; use one continuous scene instead.

10.3 **Absolutely no text in images.**
- No letters, numbers, words, signage, logos, watermarks or signatures.
- Books, scrolls, banners, maps, calendars, tablets and chalkboards are blank or use pictures only (sun, moon, flowers).
- All text is added later as real type.

10.4 **Hands, faces and bodies.**
- Five clean fingers. No fused or extra fingers or limbs.
- Even eyes. Modest clothing. Child proportions for children.

10.5 **Full body, feet on the ground (Jisun, 2026-11-19).**
- Characters are drawn **full body with feet and shoes visible**, standing on short grass or the floor.
- **Never** sunk in, buried in, or hidden by grass or flowers. That looks scary.
- Kneeling is allowed only when the shoes stay visible.
- No adult with cropped feet.

10.6 **Holy figures.**
- Jesus, Mary, Joseph, saints and angels are slightly taller (about 3 heads), calm and reverent, never silly.
- **God the Father** is never a human figure: golden light from a cloud (or a gentle hand from a cloud).
- **Holy Spirit:** a white dove with soft gold rays. Pentecost flames float above heads, never look like candles stuck in hair, and never look like fire danger.
- **Angels** are adult-looking, fully robed, with soft white feathered wings. Never cupids or babies, never nude.
- **Eucharist:** a plain round white Host, handled reverently, plus a drawn chalice.
- **Saints** wear the dress of their era and religious order, with their traditional (sourced) attributes drawn large and clear.
- **Bible scenes** use first-century clothing and no modern objects.

10.7 **Recurring cast in prayer art** (/prayers phrase illustrations; fixed).

| Character | Look (keep identical in every image) |
|---|---|
| **Theo** | Boy; short dark-brown hair; **orange sweater, blue jeans, brown shoes** |
| **Rosie** | Girl; dark bob haircut; **terracotta dress, brown shoes** |
| **Pip** | Small round fluffy **white lamb** (the site mascot) |
| **Mary** | **Blue mantle over a cream dress**, gentle face, thin gold halo |
| **Jesus** | **Brown hair, beard, white robe**, gentle face, halo |
| Father | Golden light from a cloud only |
| Holy Spirit | White dove |

- Every prayer illustration includes **Theo, Rosie and Pip**, unless the phrase is a holy scene that cannot include them (for example the Annunciation in Hail Mary 01). ⚠ O-3.
- **Exactly one** Theo, one Rosie and one Pip per image. No extra children or lambs. No duplicate Mary. No second woman in a blue mantle.
- Family members (mom, dad, grandma, baby) may appear. Keep them consistent within a prayer. Someone who has died appears only as a framed photo with a candle, never in the scene.
- Theo and Rosie must not stand on objects, and their outfits must not drift (for example Rosie in a pink sweater fails).

10.8 **People on picture cards (not fixed).**
- There is no fixed character sheet. Design people fresh for each card to fit the scene, with natural variety in skin tone, hair, family shapes, and occasionally glasses, a wheelchair or a hearing aid.
- Keep the style rules unified.
- Pip may appear; Pip never speaks and never stands in for the Lamb of God. ⚠ O-4.
- Never repeat the same child as a mascot across cards.

10.9 **Phrase art (prayer carousel).**
- Each phrase gets a **new**, rich, cute illustration showing what the phrase means. Never reuse card art for phrase slides.
- 4:3 landscape. Delivered as `public/prayers/<prayer-slug>/<NN>.webp` (2-digit phrase number), currently 960×720 WebP; working masters are 1152×864 JPG in `/workspace/plan/prayer-art/out/`.
- The grid tile and carousel cover are `public/prayers/<slug>/tile.webp` (776×792, same framing as the Rosary drawing). Never use homepage or resource card thumbs.
- Register each picture in `PRAYER_ART` in `src/lib/prayers/prayer-art.ts`. A missing picture shows a cream placeholder.

10.10 **Generating images.**
- Keep the style consistent by attaching an approved reference image (for prayer art, `/workspace/plan/prayer-art/out/sign-of-the-cross-01.jpg`, 4:3).
- Change one thing per edit ("…keep everything else identical").
- Batch by set.
- Log every image as ACCEPT or FAIL with a reason (see `/workspace/plan/prayer-art/phase2-qc-log.txt`).
- AI generation is disclosed only on the Sources & copyright page (Article 4.7); never on the image itself.

10.11 **Image QC checklist** (every image; a single fail means redo).
- [ ] Matches the site style; no photo, 3D, neon or dark background.
- [ ] No letters, numbers or signs anywhere.
- [ ] Meaning of the phrase or card is clear at small size.
- [ ] Every person is full body with feet and shoes visible, standing on the floor or short grass; nobody is sunk in grass.
- [ ] Exactly one of each recurring character; no duplicate kids, lambs or Marys.
- [ ] Outfits match the cast table (prayer art).
- [ ] Father shown as light, Holy Spirit as a dove, angels as robed adults.
- [ ] Nothing violent or scary; hard concepts shown as symbols.
- [ ] Hands, eyes and limbs are clean.
- [ ] Faith accuracy: attributes, liturgical colours, era dress.
- [ ] No legend scene.
- [ ] Composition bands clear (cards); focal subject inside the safe margin.

---

## Article 11. Design: prayer carousel and page surfaces

11.1 **Carousel flow.**
- URL: `/prayers?prayer=<slug>`.
- Order: cover, then one slide per phrase, then the level activities, then the worksheet links.
- Activities:
  - **Little:** tap the missing word.
  - **Growing:** fill in the blanks.
  - **Ready:** write each phrase from the picture alone.
- Worksheet links show the Plus badge.

11.2 **Slide layout.**
- The picture sits in a rounded 24 px frame at 4:3 (cover 1:1).
- The phrase text is below on a paper panel: Fredoka 600, `clamp(24px,4.4vw,38px)`, ink `#3b2a1f`, centred.
- Large ◀ ▶ buttons (54 px; Next is filled orange) and progress dots.
- Keyboard ← → and Esc. Tap targets at least 44 px. Respect `prefers-reduced-motion`.

11.3 **Prayer text is never altered by level.** Levels change only the chunking, pictures and activities.

11.4 **Page details Jisun set.**
- The "Q&A Cards" title is centred and uses the same style as the "Catholic Prayers" title.
- No intro paragraphs or topic intros on /qa-cards.
- No "⭐ Big idea" label or breadcrumb on /prayers.
- No "All prayers in 10 languages" section.
- Rosary: keep the mobile layout; on desktop the cards are larger.

---

## Article 12. Design: Instagram and Pinterest

12.1 **Instagram.**
- Daily English posts around noon Toronto time:
  - a **4-slide Q&A post**:
    1. kicker + question
    2. the site answer
    3. "Try this" (with an optional small monoline icon)
    4. "Coming up": a worksheet or activity preview + "Link in bio"
  - plus a **4-slide saint post** on feast days of saints that have an indexed Fact Box page.
- Format: 1080×1350.
- Palette: background `#F7EEE3`, ink `#342A26`, muted `#7A6A60`, kicker and rules in seasonal violet `#5C4676`. Fraunces and Source Sans 3; sizes as in `/workspace/insta/STYLE.md`.
- Use only public page text and public card thumbs, never Plus originals.
- The CTA or last slide is simple (site name + site image or logo).
- Remove helper text ("Always free", "No sign-in", "Swipe →").
- The feed should feel collectible and save-worthy.
- Captions have 4 lines. The first is "Save this to read with your kids 🔖". The middle line is one warm natural sentence. Add hashtags.
- Content is official and verified only: no ages, no legends. Saint carousels use friendly spoken English, line art, sourced facts only.

12.2 **Pinterest.**
- Pins are written from the viewer's perspective:
  - the image has a one-line benefit at the top, a large Sunday or feast name readable on phones, and a real preview below;
  - the title leads with real search terms, then the benefit;
  - the description has 4 lines: a question about the reader's need; what's included and how to use it; a pointer to the resource; 2–3 hashtags.
- Boards: "Printable Catholic Sunday Sheets" (Monday sheet pins); "Catholic Kids Crafts & Activities"; "Catholic Saint & Liturgical Season Cards".
- From 11/29/2026 Sunday titles say "(Year B)". Advent titles start with "Advent".
- Only one pin per day. Link to the item's own page.
- Respect the gating wording rule (no "free" tag on Plus items). ⚠ O-10.

---

## Article 13. Production workflow and repository rules

13.1 **Repository.**
- `jisunpark28/catholickidscrafts`. Next.js 15, next-auth v5, Prisma/Neon, Vercel.
- Main checkout: `C:\Users\jisun\cpac\catholickidscrafts` (Windows, PowerShell). There, run **only** `git fetch` and `git worktree add`.

13.2 **Hard rules.**
- Edit only in a **new worktree** (`..\ckc-<topic>`, new branch from `origin/main`).
- **Never commit or push.** Jisun commits and pushes. After her push, the bot opens the PR (base `main`) and sends her the link. If the branch's PR is already merged, give a new-branch flow.
- **Never touch** `progress.txt`, `src/app/(site)/sunday/page.tsx`, or `src/components/home/RoleNavShell.tsx`.
- **No `npm`/`pnpm` installs.** A `node_modules` junction to the main checkout is allowed. Remove it afterwards, together with `.next`, `next-env.d.ts` and `tsconfig.tsbuildinfo`. Use a dummy `DATABASE_URL` for builds.
- **Never run migrations or seeds against production Neon. No production DB writes** without Jisun's explicit approval for that exact change. Approval is one-time and does not carry over. Merged migrations auto-apply on production deploy, so flag every migration.
- **Admin access is security-critical.** Never use admin credentials, tokens or passwords in chat; Jisun must never paste secrets in chat.
- Keep **CRLF** line endings on files that use them.
- Coordinate with other open PRs; do not edit files that another open branch owns.

13.3 **Push commands for Jisun** (PowerShell).
```powershell
cd C:\Users\jisun\cpac\<worktree>
git add "path/one" "path/two" ":(literal)src/app/(site)/[slug]/page.tsx"
git status --short
git commit -m '<type(scope): summary>'
git push -u origin <branch>
```
- Quote every path and separate them with spaces.
- Use `:(literal)` for paths with `[...]` or `(...)`.
- Use single quotes for the commit message.

13.4 **File placement and naming.**

| Asset | Path |
|---|---|
| Worksheet PDFs (private) | `assets/activities/<slug>/<slug>.pdf`, `<slug>-color.pdf` |
| Worksheet previews (public) | `public/images/activities/<slug>/preview-bw.webp`, `preview-color.webp` |
| Editor model | `src/data/activities/<slug>.model.json` |
| Prayer sheet catalog (generated) | `src/lib/resource/prayer-sheet-list.ts`, `prayer-sheet-models.ts` (never hand-edit) |
| Crafts | Private Blob (`scripts/activities/crafts/*`) |
| Card catalog | `src/data/cards/cards.json`; thumbs `public/cards/thumbs/<ID>.webp`; locked `public/cards/locked/<ID>.webp` |
| Prayer data | `src/data/prayers/prayer-phrases.json` |
| Prayer art | `public/prayers/<slug>/<NN>.webp`, `tile.webp`; manifest `src/lib/prayers/prayer-art.ts` |
| Faith Journal | `src/lib/daily-mass/family-talk*.ts` (per-year files, CRLF) |
| Sunday sheets | `src/data/sunday-sheets/*.json`; editor bases `public/sheet-bases/` |
| Slugs | lowercase kebab-case; prayer worksheets `<prayer>-<little|growing|ready>-worksheet[-part-n]` |

13.5 **Registering a worksheet** (`src/lib/resource/activities.ts`, type `ResourceActivity`).
- Fill every field:
  - `slug`, `title`, `kind` (tile label), `summary` (one line)
  - `description` (about 150 characters)
  - `seasons`, `keywords` (search words)
  - `pageSize: "US Letter"`
  - `previews`, `files`, `tryThis` (exact Q&A line)
  - `prio`
  - `access` (`"plus"` by default; `"signin"` only if it is scheduled)
  - `seoTitle`, `editable`, `storage`
- Scheduling goes through `ACTIVITY_SEASON_WEEKLY`, `ACTIVITY_FIXED_FEASTS` and `recurringActivitySlug`.
- Link cards to worksheets in `card-related.ts`.

13.6 **Build and test** (in the worktree).
- `npm run lint`, then `next build` (with a dummy `DATABASE_URL`).
- `npm run test:activities`, `test:worksheet-access`, and `test:resource-unified` (plus `test:virtues`, `test:sidebar` etc. when touched).
- Python generators: `python scripts/activities/<family>/build_*.py [slug]` (ReportLab + Pillow, `pdftoppm` for previews). Then export editor models.
- Check pages in a desktop and a mobile browser, and show Jisun screenshots.
- Report tests that already fail on `main` as pre-existing.

13.7 **Delivery to Jisun.** A short Korean summary, then the screenshots, then the PowerShell push block. Never send secrets.

---

## Article 14. Pre-publish checklists

### 14.1 Every worksheet
- [ ] Content is from an approved source; no legend, age or grade, no violence; the question is not a verbatim quote.
- [ ] US Letter, one page (or parts), inside `SAFE`; Baloo 2 and Comic Relief only.
- [ ] B&W and colour PDFs both built; same layout; fills-only difference.
- [ ] Header, footer ("catholickidscrafts.com") and group names present.
- [ ] Words checked; no overlap or overflow; art centred in boxes.
- [ ] Previews 600×776 WebP (bw + colour) generated.
- [ ] Catalog entry complete; `access: "plus"` unless scheduled; no "free" wording.
- [ ] Searchable in Printables (keywords); linked from the related card or Q&A where relevant.
- [ ] Tests pass; no production DB writes; no forbidden files touched.

### 14.2 Every card
- [ ] 1080×1350 PNG, cream `#fef9f6`, badge, title, well, caption and footer per 9.2.
- [ ] Text typeset, not drawn by the model; caption stored without quotes.
- [ ] Scripture is NABRE exact; prayers are official; no source printed on the card.
- [ ] Saint facts sourced; unknown fields empty; no legend.
- [ ] Thumb (432×540, q74) and locked preview (216×270, grey, blur 3, q40) built; original private.
- [ ] Unique ID; groups set; detail page uses the saint-card layout with intro + 3 questions.
- [ ] Image passes 10.11.

### 14.3 Every illustration
- [ ] Passes every item in 10.11.
- [ ] Correct aspect: prayer phrase 4:3; tile 776×792; card well per 9.2.
- [ ] Saved with the right name and path, and registered in its manifest.
- [ ] Logged as ACCEPT, or FAIL with a reason.

### 14.4 Every social post
- [ ] English, calm, minimal; no helper text; no prompt-like caption line.
- [ ] Public assets only; facts verified; no ages or legends.
- [ ] One pin per day; a Korean report with the link sent to Jisun afterwards.

---

## Article 15. Reference files

| What | Where |
|---|---|
| Card "Little Light" master prompt, layout codes, people guide, official texts (its footer/copyright notice is superseded by Article 4.1) | Box: `/workspace/cards/master-prompt.md` |
| Painted-card measurements and the card pipeline | Repo: `docs/virtues-plan.md` §4 |
| Worksheet drawing kit | Repo: `scripts/activities/daily/kit.py`, `sheets.py`, `build_sheets.py` |
| Prayer worksheets | Repo: `scripts/activities/prayers/` |
| Church-year wheel sheet | Repo: `scripts/activities/new-church-year/` |
| Activity catalog and gating | Repo: `src/lib/resource/activities.ts`, `week.ts` |
| Prayer carousel styles | Repo: `src/styles/prayer-carousel.css`; Q&A cards: `src/styles/qa-cards.css` |
| Site tokens | Repo: `src/app/globals.css` |
| Sunday sheet editor bases | Repo: `docs/SHEET_BASES.md` |
| Prayer plan, phrase list, QC log, art | Box: `/workspace/plan/prayers-redesign-ideas.md`, `prayers-phrase-illustrations.md`, `prayer-art/` |
| Crafts and activity plan (legend and violence removals) | Box: `/workspace/plan/ckc-crafts-activity-plan.md` |
| Faith Journal schema and rules | Box: `/workspace/faith-journal/NOTES.md` |
| Instagram style | Box: `/workspace/insta/STYLE.md` |

---

## Article 16. Open items (⚠ NEEDS CONFIRMATION)

| # | Item | Conflict | Interim rule |
|---|---|---|---|
| O-1 | Prayer text source | maria.catholic.or.kr verbatim (2026-10-21) vs USCCB/ICEL/Missal (2026-10-29, 11-19) | USCCB/ICEL/Missal |
| O-2 | Card illustration medium | Flat "Little Light" chibi, no watercolor (master prompt) vs painted watercolor / colored pencil (live set, Jisun's later note) | Match the live painted set |
| O-3 | Theo, Rosie and Pip in every prayer image | The rule says every image, but some holy scenes (Annunciation, Nativity) have none | Include them unless the scene is a biblical moment; ask when unsure |
| O-4 | Pip's look | Master prompt: orange ribbon collar with gold bell; prayer art: plain white lamb | Plain white lamb in prayer art; collar on cards only if existing cards show it |
| O-5 | Jesus' and Mary's clothing | Master prompt: Jesus white tunic + red mantle, Mary white/rose dress + white veil; prayer art: Jesus white robe, Mary cream dress + blue mantle | Prayer art uses the fixed cast; cards follow the master prompt |
| O-6 | Crafts access | 2026-11-11: 7 member-free craft picks vs 2026-11-19: all crafts Plus, no free tags | All Plus (newer) |
| O-7 | Weekly admin content | 2026-10-21: all free and public, no lock vs 2026-11-19 master gating | Leave as is; ask before adding new weekly items |
| O-8 | Spelling | British/Canadian ("colour") on the site vs American ("color") in the Faith Journal and some UI | Follow the file you are editing |
| O-9 | Sheet watermark | Logo + Instagram handle watermark idea vs current footer URL only | Footer URL only |
| O-10 | Pinterest wording | Older pin rules mention "free resource" | No "free" tag on Plus items; describe the week's sign-in access only if the item is scheduled |
| O-11 | Instagram caption | `STYLE.md` approved a 3-line caption with "no emoji" vs later rule: 4 lines starting "Save this to read with your kids 🔖", no prompt-like line | Later rule |
| O-12 | Calendar | Faith Journal follows USCCB (US transfers) vs the crafts plan uses CCCB (Canada) rules | Keep each file consistent with its own source |
| O-13 | Card title font | Not recorded; must be matched from a crop | Choose among Nunito, Fredoka and Baloo 2; record it |
| O-14 | Level names in Rosary | Rosary uses Mini, 1 Decade and Full, with 🌱/⭐/🕊️; whether to rename to Little/Growing/Ready is undecided | Keep current |
| O-15 | Unsourced prayers | St Francis Peace Prayer, Holy Water Prayer, Prayer After Communion | **Resolved 2026-11-25:** common prayers are used as-is with no source record or label (Article 3) |

---

## Article 17. Change log

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-11-25 | First edition, compiled from the bot's memory (~280 facts), box planning files, the card master prompt, the prayer-art QC log, and the repo (`origin/main` 147d929). |
| v1.1 | 2026-11-25 | Owner decisions: common prayers used as-is with no source record; individual Scripture verses need no attribution (no whole-Bible reproduction); AI illustrations allowed and disclosed only on the Sources & copyright page; all source and copyright statements live only on `/sources`. Updated Articles 3, 4.1, 4.2, 4.7 (new), 10.10, 15 and O-15. |
| v1.2 | 2026-11-27 | Owner decision: no citation numbers or translation credits in user-facing text; no prompt or meta guardrail sentences in the UI; copy stays concise and scannable. Article 5.8 still forbids age or grade text. Added 5.11–5.13 and a cross-reference in 2.9. |
| v1.3 | 2026-11-27 | Owner decision: no school grade labels in body, cards, FAQ, or metadata; no country or region wording in body copy. Added 5.14 and 5.15. |
| v1.4 | 2026-11-27 | Owner decision: Print worksheet readability rules for Mass print sheets. Sunday sheets stay on the existing Gospel sheet styles. |

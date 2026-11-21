# Virtues sidebar — planning document

Planning only. This pull request adds this file and does not build the feature, change cards, or touch the open Advent work.

Kid-facing copy in the tables below must ship with no four-digit calendar year. This document follows that rule too.

## 1. Repo facts checked before writing

`main` at the time of writing is `87e0afe` (merge of pull request #405, prayer illustrations). Two pull requests are open, both against that same `main`, and this plan does not edit their files:

| PR | Branch | What it changes | Why it matters here |
| --- | --- | --- | --- |
| [#406](https://github.com/jisunpark28/catholickidscrafts/pull/406) | `cursor/gospel-cards-mark-matthew-3796` | Adds Bible cards BIB-053, BIB-054, BIB-055 (PNG originals, thumbs, locked previews, `cards.json`, `designed-originals.json`) and a merge-safe tweak to `scripts/build-evergreen-card-faces.mjs` | These are the three cards whose art does not match the painted catalog. Section 4 measures them. Do not reuse their ids. Do not edit that branch from the virtues work. |
| [#407](https://github.com/jisunpark28/catholickidscrafts/pull/407) | `cursor/advent-launch-readiness-e9f0` | Advent free-week rules, home row, undated calendar | Unrelated. Virtues work must not edit those activity or home files. |

Another agent is editing this repo. Virtues implementation should stay off `cards.json`, `designed-originals.json`, `scripts/build-evergreen-card-faces.mjs`, and the Advent files until #406 and #407 have merged or been deliberately rebased.

## 2. What to build, and what already exists

The sidebar today is `SIDEBAR_ITEMS` in `src/lib/sidebar-navigation.ts`, rendered by `src/components/home/SidebarNavigation.tsx`:

1. Printables → `/resource`
2. Daily Mass → `/daily-mass`
3. Play & Learn → `/play`
4. Mom's Bible → `/moms-bible/situations`
5. Q&A Cards → `/qa-cards`
6. Prayer → `/prayers` (this item also highlights `/catholic-virtue-challenge`)
7. Saints → `/catholic-saints-for-kids`
8. My Binder → no route yet; Plus badge; hidden unless the reader has a paid Plus grant

Add a sibling item labeled **Virtues**. The Korean name **덕목** is the internal name for this section (data file and code comments). The button the child sees says Virtues, unless Jisun wants the Korean word on the button too (open question 1).

Clicking a virtue opens a full-screen carousel, same interaction family as `src/components/prayers/PrayerCarousel.tsx` (portal, body scroll lock, background `inert`, swipe, close, URL state). Slides, in order:

1. Two or three Bible stories. Each slide cites book, chapter, and verses, plus one kid sentence that matches the text.
2. One key verse in the exact NABRE wording from [bible.usccb.org](https://bible.usccb.org), including a note when the sentence starts with a conjunction or continues the previous verse.
3. Two or three school or home situations, each with one or two short questions that lead toward the virtue.
4. One line that starts “I will…” and names the virtue, then a short encouragement.
5. One existing worksheet, with the real link into it, to invite Plus. If no suitable worksheet exists, the slide says so. It does not invent a sheet.

This is a new product. It does not replace the Family Virtue Challenge.

The challenge already has 24 sheets (`src/lib/evergreen-catalog.ts`, `src/data/evergreen-sheets/VIR_*.json`) and 24 icon cards (VIR-054–VIR-077, set `Family Virtue Challenge`). Those 24 names come from a character-strength list (Creativity, Curiosity, Zest, Humor, and so on), grouped as Wisdom, Courage, Humanity, Justice, Temperance, Transcendence. Ten of those names also appear in the Catholic list below. The other fourteen challenge sheets are a different curriculum and stay where they are: `/catholic-virtue-challenge` and `/catholic-virtue-challenge/[slug]`. Prayer’s sidebar highlight continues to include that hub so the old pages do not go dark.

Card titles already disambiguate two overlaps: VIR-071 is “Prudence (Virtue Challenge)” and VIR-075 is “Hope (Virtue Challenge)”. New story cards must not be titled with the bare virtue name when that title is already taken.

## 3. The 24 virtues

Catholic structure used to choose them:

- Theological virtues: faith, hope, charity (CCC 1812–1829).
- Cardinal virtues: prudence, justice, fortitude, temperance (CCC 1805–1809). Fortitude is presented to children as **Courage**, one virtue, not two.
- Fruits of the Spirit. CCC 1832 gives the Church’s list of twelve: charity, joy, peace, patience, kindness, goodness, generosity, gentleness, faithfulness, modesty, self-control, chastity. The NABRE of Galatians 5:22–23, read on bible.usccb.org, is shorter and does not use those twelve English words. The verified sentence is: “In contrast, the fruit of the Spirit is love, joy, peace, patience, kindness, generosity, faithfulness, gentleness, self-control.” Goodness, modesty, and chastity are in the catechism’s traditional list, not as extra words in that NABRE verse.
- Other kid-relevant virtues with their own paragraph or commandment: humility, honesty, forgiveness, gratitude, obedience, perseverance, respect, responsibility, and purity of heart (the modest, age-right face of chastity).

Goodness is not its own card, so the list stays at 24. It is already inside charity and kindness. Chastity is not its own card. For children it is **Purity of heart**: a clean heart, modest eyes, words, and clothes (CCC 2518, 2521–2522; Matthew 5:8). No sexual teaching, no dating scenarios, and no use of Genesis 39.

| # | Virtue | Basis | Key verse (NABRE) | Worksheet |
| --- | --- | --- | --- | --- |
| 1 | Faith | CCC 1814–1816 | Hebrews 11:1 | none |
| 2 | Hope | CCC 1817–1821 | Romans 15:13 | `hope` exact |
| 3 | Charity | CCC 1822–1829 | John 13:34 | `love` closest |
| 4 | Prudence | CCC 1806 | Matthew 7:24 | `prudence` exact |
| 5 | Justice | CCC 1807 | Micah 6:8 | `fairness` closest |
| 6 | Courage | CCC 1808 (fortitude) | Matthew 10:31 | `courage` exact |
| 7 | Temperance | CCC 1809 | Titus 2:12 | none |
| 8 | Humility | CCC 2559; also 2546 | Luke 14:11 | `humility` exact |
| 9 | Kindness | CCC 1832; Galatians 5:22 | Ephesians 4:32 | `kindness` exact |
| 10 | Honesty | CCC 2464–2468 (eighth commandment) | Ephesians 4:25 | `honesty` exact |
| 11 | Forgiveness | CCC 2840–2845 | Colossians 3:13 | `forgiveness` exact |
| 12 | Patience | CCC 1832; Galatians 5:22 | Colossians 3:12 | none |
| 13 | Gratitude | CCC 2637–2638 | 1 Thessalonians 5:18 | `gratitude` exact |
| 14 | Obedience | CCC 2214–2217; CCC 144 | Ephesians 6:1 | none |
| 15 | Generosity | CCC 1832; Galatians 5:22 | 2 Corinthians 9:7 | none |
| 16 | Self-control | CCC 1832; Galatians 5:23 | Sirach 18:30 | `self-control` exact |
| 17 | Purity of heart | CCC 2518, 2521–2522; Matthew 5:8 | Matthew 5:8 | none |
| 18 | Perseverance | CCC 162, 1821; fortitude’s endurance in CCC 1808 | Galatians 6:9 | `perseverance` exact |
| 19 | Respect | CCC 1929–1933; 1 Peter 2:17 | 1 Peter 2:17 | none |
| 20 | Responsibility | CCC 1731–1738 | Luke 16:10 | none |
| 21 | Gentleness | CCC 1832; Galatians 5:23 | Matthew 11:29 | none |
| 22 | Joy | CCC 1832; Galatians 5:22 | Philippians 4:4 | none |
| 23 | Peace | CCC 2304; Galatians 5:22 | John 14:27 | none |
| 24 | Faithfulness | CCC 1832; Galatians 5:22 | Matthew 25:21 | none |

Every key verse below was read on bible.usccb.org for this plan. Quotes keep the NABRE’s own words, including “holy Spirit”, lowercase “sabbath”, and “LORD”. Story sentences whose chapter was opened are marked **read**. The others match the NABRE narrative and must be re-read on bible.usccb.org before the copy is frozen. Do not paste a Douay-Rheims line from `keyVerseDR` into these slides. The challenge sheet for courage, for example, quotes Joshua in Douay wording; the new key verse is the NABRE of Matthew 10:31.

Rejected stories, so they are not used later by accident:

- Ananias and Sapphira (Acts 5). They die. Too harsh for this age.
- The boys and the bears (2 Kings 2). Violent.
- Joseph and Potiphar’s wife (Genesis 39). Sexual. Not for this bundle.
- Any chastity lesson about bodies, dating, or marriage. Purity of heart stays at eyes, words, clothes, and a clean heart.

## 4. Card format audit

### 4.1 Two different card families already on `/resource?view=cards`

`src/data/cards/cards.json` currently has 666 picture cards. The comment at the top of `src/lib/resource/cards.ts` still says 654, so the JSON is the count to trust. Almost all of the painted faces live as public thumbs at `public/cards/thumbs/<ID>.webp` (432×540). The full 1080×1350 PNGs for those older cards are private (Vercel Blob via `src/data/cards/originals-manifest.json`, read by `src/lib/resource/card-originals.ts`). They are the cards a visitor sees for Bible, Virtue & Life, and Saints.

A second family is the 28 generated faces in `assets/card-originals/` (VIR-054–VIR-077 and MAS-066–MAS-069). `scripts/build-evergreen-card-faces.mjs` draws them as flat SVG: cream `#fcf8f1`, a hairline outer frame, a green or brown pill reading “FAMILY VIRTUE CHALLENGE” or “ORDER OF THE MASS”, and a simple icon inside a circle. `assets/card-originals/README.md` says these are “warm vector-designed faces, not painted artwork.” They are the challenge icons. They are not the spec for story cards.

Jisun’s note, and the painted thumbs, describe the first family: a soft warm watercolor / colored-pencil storybook scene on cream. Reference faces used for the measurements below:

- `public/cards/thumbs/BIB-001.webp` (Creation)
- `public/cards/thumbs/BIB-010.webp` (Manna)
- `public/cards/thumbs/BIB-031.webp` (Jesus Blesses the Children)
- `public/cards/thumbs/VIR-001.webp` (The First Commandment)
- `public/cards/thumbs/VIR-020.webp` (Feed the Hungry)
- `public/cards/thumbs/SNT-001.webp` (Saint Peter)

Thumbs were measured after a smooth scale-up to 1080×1350, because the originals of these painted cards are not in the repo. Positions are therefore about ±2 px. BIB-053/054/055 were measured from the PNGs on the #406 branch (`1080×1350` RGBA), not from thumbs.

### 4.2 Painted-card spec (the one to match)

| Piece | Spec |
| --- | --- |
| Canvas | 1080×1350 px, ratio 4:5. Public thumb 432×540 WebP (`scripts/build-card-thumbs.ts`, quality 74, `fit: cover`). Locked preview 216×270, greyscale, blur 3, WebP quality 40 (`scripts/build-card-locked-previews.mjs`). The evergreen script writes thumbs at quality 80; new cards should use the thumb script’s 74 so they match the painted set. |
| Page background | `#fef9f6` at the corners. The corner sample is flat (no paper noise in the margin). There is no outer rounded frame around the whole card. |
| Badge | Orange pill, top center. Ink from y 47 to y 89 (height 43). “BIBLE” is x 485–594 (width 110). “VIRTUE & LIFE” is x 435–644 (width 210). Saint pills grow with the label (about 225 px for “SAINT · JUN 29”). Fill at the left interior of the pill is about `#d45400`. Label is white. Fully rounded ends. |
| Title | One line of near-black ink from y 123 to y 168 (ink height 46), horizontally centered. A heavy rounded sans. Do not use Trebuchet or Arial (those are the evergreen SVG). Match a crop of BIB-031 rather than guessing a family name. The site already loads Nunito, Fredoka, and Baloo 2 for other kid UI; pick whichever of those matches the crop, and record the choice in the compositor. |
| Illustration well | Top of the stroke near y 240, bottom near y 999 (about 759 px tall). Left stroke on the reference cards sits around x 90 (BIB-031) to x 114 (VIR-001). Stroke color about `#e1dbcd`. The painting goes up to the stroke. Measured gap from stroke to non-cream scene: 0. Inside the well, pixels close to the page cream are under 1%. |
| Scene | Warm storybook watercolor / colored pencil. Ground inside the well is often `#fff5e1` or `#fdf7e5`, not a second white mat. An 80 px patch at the center of BIB-031 has on the order of 270 reduced color bins; SNT-001 has on the order of 580. Near-black outline pixels are rare (VIR-001 about 0, BIB-001 about 0.04%, BIB-031 about 1.5%). Figures are soft, with paper-like color, and they fill the well. |
| Caption | Bold, centered, low on the card. A one-line caption such as BIB-031 sits at about y 1238–1265 (ink height about 28). A two-line caption such as VIR-001 sits at about y 1184 and y 1238. Many painted captions are the catalog sentence with no extra quotation marks painted on. BIB-031’s picture does include quotes; that is not consistent across the set. |
| Footer | Card id at the lower left, `catholickidscrafts.com` at the lower right. Darkest footer pixel on the reference cards is about `#a8a29b`, near y 1323–1328. |
| Catalog | `text` is the caption. The opened card page wraps that caption in one pair of quotes (this is what #406 documented and tested). Store `text` with no quotation marks so the page does not double them. |

Share URL for a card is `/resource?view=cards&card=<ID>` (`cardSharePath` in `src/lib/resource/card-meta.ts`). Full PNG download is Plus via `/api/resource/cards/<ID>/download`. Thumbs are public. Locked greyscale thumbs are what free visitors see on a Plus-locked tile.

### 4.3 How BIB-053, BIB-054, and BIB-055 differ

All three are the right canvas size (1080×1350 PNG) and the right corner color (`#fef9f6`). The mismatch is the frame, the type, and the drawing. Compared with BIB-031, BIB-001, and VIR-001:

| Piece | Painted cards | BIB-053 / 054 / 055 |
| --- | --- | --- |
| Badge | Height 43, y 47–89. “BIBLE” width 110. Fill about `#d45400`. | Height 46, y 48–93. Width 144 (x 468–611) for the same word “BIBLE”. Left-interior fill `#e0630e` (lighter, more yellow). |
| Title | Ink y 123–168, height 46. | Ink starts at y 129. BIB-053 and BIB-054 ink height is about 39. The titles are wider and sit in a different x-height. |
| Well | Stroke near x 90–114, color about `#e1dbcd`. Scene touches the stroke. | Stroke at x 45, color `#e6d7c6` (lighter, pinker). The frame is much wider and closer to the edge. |
| Inside the well | Near-cream fraction under 1%. The story fills the rounded rectangle. | A `#fffdf9` mat inside the frame. Near-cream fraction about 27% (BIB-053), 22% (BIB-054), 68% (BIB-055). BIB-055’s center 80 px patch has about 45 color bins, against hundreds on the painted cards. |
| Drawing | Soft watercolor / colored pencil, warm paper, figures integrated into a place. | Flat vector characters: uniform outlines, sticker-like Jesus, empty cream around them. BIB-054 retells the same moment as BIB-031 (Jesus blessing children) in this flatter style, so the two would sit side by side and not match. |
| Caption | Low, about y 1238 for one line. | Higher: BIB-053 about y 1080–1109; BIB-054 and BIB-055 two lines around y 1080–1151. Quotes are painted into the PNG. The page will add another pair. |
| Footer | About y 1323, gray about `#a8a29b`. | y 1291, lighter `#b7b1aa`. |

#406’s catalog rows and Scripture lines are a separate question from the art. The JSON captions are stored without quotes, and the tested NABRE fragments match what was re-read for this plan (“Stretch out your hand.”, “Let the children come to me; do not prevent them”, “So do not be afraid; you are worth more than many sparrows.”). The pictures do not match the painted spec. Fix the pictures; do not treat those PNGs as the template for the 24 virtues.

### 4.4 How to produce every virtue illustration in that spec

Do not run `scripts/build-evergreen-card-faces.mjs` to make these cards. On `main` that script rewrites `designed-originals.json` with only the 28 vector ids. #406 changes it to merge. Either way it draws the wrong family.

Recommended pipeline:

1. A new compositor, `scripts/build-virtue-card-faces.mjs`, typesets only the chrome from `cards.json`: page `#fef9f6`, pill, title, caption, footer, using the measurements in the table above. It masks a full-bleed illustration into the rounded well. It does not ask an image model to draw the words.
2. Each story illustration is generated for the well only, with a written prompt: soft warm watercolor and colored pencil, cream paper, storybook children and adults, scene filled to the edges, no caption, no logo, no pill, no flat vector, no sticker outline, no empty mat. Reject any output whose near-cream fraction inside the well is above a small threshold (the painted cards are under 1%; a gate around 8% would already have failed all three #406 pictures).
3. The same script writes `assets/card-originals/<ID>.png`, merges that id into `src/data/cards/designed-originals.json` without dropping other ids, writes `public/cards/thumbs/<ID>.webp` at 432×540 quality 74, and writes `public/cards/locked/<ID>.webp` at 216×270 greyscale blur 3 quality 40.
4. It appends the catalog row if the id is new: `cat` `"Virtue & Life"`, `set` `"Virtues"` (a new set, not `Family Virtue Challenge`). `cardGroupIds` already files `Virtue & Life` under Virtue cards (`virtue-for-kids` in `src/lib/resource/card-groups.ts`). No category enum change is required.
5. A test asserts canvas size, corner color, badge band, well bleed, footer band, no quotation marks in `text` or in the painted caption region, and no four-digit year.
6. Ids start at VIR-078. VIR-077 is the last challenge card. Do not take BIB-053, BIB-054, or BIB-055.
7. Before the first new original is committed, change the evergreen builder so it updates only its own 28 ids and merges the manifest. That is the same idea as the one-line change already sitting in #406. Coordinate so the two edits do not fork the script.

One card per Bible-story slide. Scenario slides, the verse slide, the commitment slide, and the worksheet slide are carousel UI, not new picture cards, unless Jisun asks for those pictures too (open question 6).

Courage’s two gospel moments already have catalog cards if #406 merges, but those pictures fail this spec, and BIB-031 is already the painted card for the children. The courage bundle should link story cards that pass the spec. Whether those are repaired BIB-053/054/055 or new VIR ids is open question 3. Default recommendation: new VIR story cards in the Virtue set, and leave #406’s Bible ids for a separate art fix so this work does not edit that branch.

## 5. Full content

Worksheet column: public page `/catholic-virtue-challenge/<slug>`, print `/print/evergreen/<slug>` (sign-in, then Plus). Sheet key and the challenge card thumb are listed in section 6. There is no static preview file for these sheets.

“Confirm” on a story means: the event and the citation are the NABRE passage named, and the exact sentences must be read again on bible.usccb.org before they are shown to children. “Read” means that chapter was opened for this plan.

### 5.1 Faith

- Basis: CCC 1814–1816. Faith is the theological virtue by which we believe God and all that he has revealed.
- Key verse, Hebrews 11:1, read: “Faith is the realization of what is hoped for and evidence of things not seen.” NABRE does not say “assurance” or “conviction”. The USCCB note on this verse says those RSV words were set aside.
- Stories:
  1. Hebrews 11:7, read. Noah is warned about what he has not yet seen, and with reverence he builds an ark for his household.
  2. Hebrews 11:8, read. Abraham obeys when he is called to go out, and he goes without knowing where he is going.
  3. Matthew 8:5–13, confirm. A Roman officer trusts Jesus to heal his servant with a word, and he does not ask Jesus to come under his roof.
- Scenarios:
  1. A science worksheet and a Bible story seem to disagree, and a classmate says, “So the Bible isn’t true.” Questions: What could you say that is honest and still trusts God? Who at home could help you sort the question without tossing either one away?
  2. You pray for something and it does not happen that day. Questions: Does trusting God mean he does whatever we pick? What is one true thing about God you can hold onto while you wait?
- Commitment: “I will have faith: I will trust God and say what is true about him, even when I cannot see how it will work out.”
- Encouragement: “Faith is God’s gift. You can ask for it.”
- Worksheet: none. `spirituality` is a different challenge sheet. Do not attach it.

### 5.2 Hope

- Basis: CCC 1817–1821. Hope trusts God’s promises and looks forward to heaven, and it keeps us from giving up.
- Key verse, Romans 15:13, read: “May the God of hope fill you with all joy and peace in believing, so that you may abound in hope by the power of the holy Spirit.”
- Stories:
  1. Hebrews 11:11, read. Abraham and Sarah are past the usual age, and Sarah is sterile, yet they trust the one who made the promise.
  2. Luke 2:25–32, confirm. Simeon has waited for the consolation of Israel. When he holds the child Jesus, he says he can go in peace because he has seen the Lord’s salvation.
  3. Luke 24:1–12, confirm. The women find the tomb empty, and the news is that Jesus is alive. Hope here is about a person who rose, not a wish.
- Scenarios:
  1. You fail a test you studied for. Questions: What is one next step that is still worth taking? How is that different from pretending the grade does not matter?
  2. A grandparent is sick and you are scared. Questions: What can you ask God for? What is one kind thing you can do while you wait?
- Commitment: “I will hope: I will keep trusting God’s promises when a day goes badly.”
- Encouragement: “The God of hope can fill you with joy and peace while you believe.”
- Worksheet: exact, slug `hope`, key `VIR_HOPE`, card VIR-075.

### 5.3 Charity

- Basis: CCC 1822–1829. Charity is the theological virtue by which we love God above all things and love our neighbor for God’s sake.
- Key verse, John 13:34, read: “I give you a new commandment: love one another. As I have loved you, so you also should love one another.”
- Stories:
  1. John 13:3–15, read. Jesus, their master and teacher, rises from supper, washes the disciples’ feet, and tells them to wash one another’s feet.
  2. Luke 10:25–37, confirm. A man is beaten and left on the road. A priest and a Levite pass by. A Samaritan stops, bandages the wounds, and pays for the man’s care.
  3. Matthew 25:35–40, read. The king says that feeding the hungry, welcoming the stranger, clothing the naked, caring for the sick, and visiting the prisoner was done for him.
- Scenarios:
  1. Someone who was unkind to you last week drops their books. Questions: What would love do in the next minute? Does charity wait until the person deserves it?
  2. You have one cookie left and a younger sibling is hoping for it. Questions: What could you do that puts them first? How can you do it without making a show of it?
- Commitment: “I will love: I will choose one person to care for today the way I would want to be cared for.”
- Encouragement: “Jesus washed feet. Love is concrete.”
- Worksheet: closest, not exact. Slug `love`, key `VIR_LOVE`, card VIR-063. That sheet is the challenge’s “Love”, interpersonal care, not the theological virtue by name. Use it, and label it as the closest sheet we already have.

### 5.4 Prudence

- Basis: CCC 1806. Prudence is right reason in action: it finds the true good and chooses the means to it.
- Key verse, Matthew 7:24, read: “Everyone who listens to these words of mine and acts on them will be like a wise man who built his house on rock.”
- Stories:
  1. Matthew 7:24–27, read. The wise person hears Jesus and acts. The rain comes, and the house on rock stands. The person who only hears builds on sand, and that house falls.
  2. 1 Kings 3:5–14, confirm. God tells Solomon to ask for whatever he wants. Solomon asks for an understanding heart to govern the people, not for a long life or riches.
  3. 1 Samuel 25:14–35, confirm. Abigail learns that David is coming in anger. She brings food, meets him, and turns him aside from taking revenge.
- Scenarios:
  1. Friends want you to sneak out of class “just for a minute.” Questions: What are the real choices, not the exciting one? Which choice will you be glad about tomorrow?
  2. You are about to send a mean reply. Questions: What happens if you wait until you are calm? Who could help you decide?
- Commitment: “I will be prudent: I will stop and think before I choose, and then I will do what I thought through.”
- Encouragement: “Prudence is not fear. It is wisdom that acts.”
- Worksheet: exact, slug `prudence`, key `VIR_PRUDENCE`, card VIR-071. The card title is already “Prudence (Virtue Challenge)”.

### 5.5 Justice

- Basis: CCC 1807. Justice is the constant will to give God and neighbor what is their due.
- Key verse, Micah 6:8, read: “You have been told, O mortal, what is good, and what the LORD requires of you: Only to do justice and to love goodness, and to walk humbly with your God.”
- Stories:
  1. 1 Kings 3:16–28, confirm. Two women claim one living baby. Solomon’s test reveals the mother who would rather give the child up than see him harmed, and he gives the child to her.
  2. Luke 19:1–10, confirm. Zacchaeus says he gives half of his possessions to the poor and pays back four times anything he has taken.
  3. Luke 18:1–8, read, used here for the just decision. A widow keeps asking a judge who respects no one, until he renders a just decision for her. Jesus says God will secure the rights of his chosen ones.
- Scenarios:
  1. You find a lunch bag that is not yours. Questions: Who does it belong to? What is the fair next step before you open it?
  2. A game was won because someone cheated, and your team benefited. Questions: What is owed to the other team? What could you say that makes it right?
- Commitment: “I will be just: I will give each person what is theirs, including the truth.”
- Encouragement: “Justice starts with small things that are not ours to keep.”
- Worksheet: closest, not exact. Slug `fairness`, key `VIR_FAIRNESS`, card VIR-067. Fairness is the nearest challenge sheet. It is not the cardinal virtue of justice. Say that on the slide.

### 5.6 Courage

- Basis: CCC 1808. Fortitude holds on to the good when it is hard, even in fear. The child-facing name is Courage. Do not also make a separate Fortitude card.
- Key verse, Matthew 10:31, read. The sentence starts with a conjunction: “So do not be afraid; you are worth more than many sparrows.” It follows Matthew 10:29–30, also read: two sparrows are sold for a small coin, and not one falls without the Father’s knowledge, and even the hairs of your head are counted.
- Stories, in this order:
  1. Mark 3:1–6, read. In the synagogue, people watch Jesus to see if he will heal on the sabbath so they can accuse him. He asks whether it is lawful to do good on the sabbath rather than to do evil, to save life rather than to destroy it. They stay silent. He says, “Stretch out your hand.” The man stretches it out and his hand is restored. The Pharisees leave and take counsel to put him to death. Kid line: Jesus heals the man’s hand on the sabbath even though angry people are watching and want to accuse him.
  2. Mark 10:13–16, read. People bring children for Jesus to touch, and the disciples rebuke them. Jesus is indignant and says, “Let the children come to me; do not prevent them, for the kingdom of God belongs to such as these.” Then he embraces them and blesses them, placing his hands on them. Kid line: When the disciples try to send the children away, Jesus stops them, welcomes the children, and blesses them.
  3. Daniel 6, confirm before quoting. A law forbids prayer to anyone but the king. Daniel still prays, is put in the lions’ den, and is found alive because God shut the lions’ mouths. Kid line: Daniel keeps praying to God when a law says not to, even though he is put in the lions’ den.
- Scenarios, using Jisun’s situations and questions:
  1. Classmates are mocking a friend’s drawing. Questions: “What would it be like if most of your class teased one friend and only you stopped?” “Have you ever thought it was okay because everyone was doing it?”
  2. Kids knock down a friend’s block tower. Questions: “How would you feel if everyone mocked your drawing or knocked down your blocks?” “What would you want a friend to do when you’re upset?”
- Commitment, from Jisun’s line, shaped as the “I will” sentence: “I will be courageous. Even when everyone joins in, I will not follow along with something that would hurt me if it were done to me.”
- Encouragement: “That is real courage. What would Jesus want us to do?”
- Worksheet: exact, slug `courage`, key `VIR_COURAGE`, card VIR-059. The sheet’s own verse is a Douay-style Joshua 1:9 line. The carousel key verse stays Matthew 10:31. Do not swap them.

### 5.7 Temperance

- Basis: CCC 1809. Temperance moderates the attraction of pleasures and keeps desires within the limits of what is honorable.
- Key verse, Titus 2:12, read. It continues verse 11 and begins with “and”: “and training us to reject godless ways and worldly desires and to live temperately, justly, and devoutly in this age,”. Show the phrase “to live temperately, justly, and devoutly in this age” and tell the reader the sentence starts in the previous verse. Do not capitalize “And” as if it were a new sentence.
- Stories:
  1. Daniel 1:8–16, confirm. Daniel asks not to eat the king’s rich food and wine. After a test of days, he and his friends look healthier than the young men who ate the royal food.
  2. Exodus 16:16–20, confirm. The people are told to gather the manna each household needs. What some of them hoard until morning spoils.
  3. Luke 12:16–21, confirm. A rich man fills bigger barns and tells himself to rest and enjoy it all. That night his life is demanded of him. Kid line, without extra scare: more stuff did not make him ready for God.
- Scenarios:
  1. The snack bag is open and you want all of it before dinner. Questions: How much is enough? What happens to dinner, and to sharing, if you finish the bag?
  2. A game is fun and a parent says it is time to stop. Questions: What is temperance in the next two minutes? What are you protecting by stopping?
- Commitment: “I will be temperate: I will enjoy good things without grabbing more than I need.”
- Encouragement: “Enough is a kind of strength.”
- Worksheet: none. Do not reuse `self-control` here; that sheet belongs to the next virtue that carries the same name.

### 5.8 Humility

- Basis: CCC 2559 (humility is the foundation of prayer) and CCC 2546 (poverty of heart).
- Key verse, Luke 14:11, read. It begins with “For”: “For everyone who exalts himself will be humbled, but the one who humbles himself will be exalted.”
- Stories:
  1. Luke 18:9–14, read. A Pharisee lists his good deeds and looks down on a tax collector. The tax collector stands far off, will not raise his eyes, and prays, “O God, be merciful to me a sinner.” Jesus says that man goes home justified.
  2. Luke 14:7–11, read. Jesus says not to take the place of honor at a banquet. Take the lowest place.
  3. Luke 2:6–7, confirm. Mary lays Jesus in a manger, because there is no room for them in the inn.
- Scenarios:
  1. You win a game and want everyone to say you are the best. Questions: What is true to say about the win? How can you notice someone else who tried hard?
  2. You are corrected and your face gets hot. Questions: What could a humble answer sound like? What are you protecting if you argue instead?
- Commitment: “I will be humble: I will tell the truth about myself and make room for other people.”
- Encouragement: “Jesus took the lowest place, and he calls that greatness.”
- Worksheet: exact, slug `humility`, key `VIR_HUMILITY`, card VIR-070.

### 5.9 Kindness

- Basis: CCC 1832 and Galatians 5:22, read. Kindness is named in the fruit of the Spirit.
- Key verse, Ephesians 4:32, read. NABRE puts the opening word in brackets because of the manuscript evidence: “[And] be kind to one another, compassionate, forgiving one another as God has forgiven you in Christ.” Keep the brackets in any note to editors. The words to show children can start at “Be kind to one another,” with a note that the verse continues a sentence.
- Stories:
  1. Luke 10:30–35, confirm, the Samaritan’s actions only: he is moved with compassion, bandages the wounds, and pays the innkeeper.
  2. Genesis 24:15–20, confirm. Rebekah gives a traveler a drink and then draws water for his camels too.
  3. Ruth 2:8–16, confirm. Boaz tells Ruth to stay and glean, warns the workers not to bother her, and makes sure she has water and food.
- Scenarios:
  1. A new student is alone at recess. Questions: What is one kind thing you could do in the next minute? How is kindness different from a big speech?
  2. A sibling is slow and you are in a hurry. Questions: What would kindness sound like? What would hurry-without-kindness sound like?
- Commitment: “I will be kind: I will do one useful good thing for someone who did not ask me to show off.”
- Encouragement: “Kindness is love with shoes on.”
- Worksheet: exact, slug `kindness`, key `VIR_KINDNESS`, card VIR-064. Do not point this at the Advent activity `secret-kindness-notes`. That sheet is a seasonal craft, not the virtue worksheet.

### 5.10 Honesty

- Basis: CCC 2464–2468. God is the source of truth. The eighth commandment forbids bearing false witness.
- Key verse, Ephesians 4:25, read. It begins with “Therefore,”: “Therefore, putting away falsehood, speak the truth, each one to his neighbor, for we are members one of another.”
- Stories:
  1. 1 Samuel 3:15–18, confirm. Samuel is afraid to tell Eli the hard message. Eli asks for everything. Samuel tells him all of it.
  2. Matthew 21:28–31, confirm. One son says he will go to the vineyard and does not. The other says he will not, and then he goes. Jesus asks which one did the father’s will.
  3. Luke 19:8, confirm, the honesty in Zacchaeus’s promise: he names what he has taken and says he will pay it back. (The justice slide may use the whole visit. This slide is only the telling of the truth.)
- Scenarios:
  1. A parent asks who broke the cup, and it was you. Questions: What is the true sentence? What gets worse if you borrow a lie?
  2. A friend wants you to say they were with you when they were not. Questions: Who gets hurt by that sentence? What could you say that stays a friend and stays true?
- Commitment: “I will be honest: I will speak the truth to my neighbor, even when it costs me.”
- Encouragement: “We belong to one another, so our words have to be true.”
- Worksheet: exact, slug `honesty`, key `VIR_HONESTY`, card VIR-061.

### 5.11 Forgiveness

- Basis: CCC 2840–2845, in the petition “forgive us our trespasses.”
- Key verse, Colossians 3:13, read. It continues verse 12 and starts with a lowercase participle: “bearing with one another and forgiving one another, if one has a grievance against another; as the Lord has forgiven you, so must you also do.” Show it as the continuation it is, not as a fresh capital sentence.
- Stories:
  1. Genesis 45:1–15, confirm. Joseph tells the brothers who sold him who he is. He weeps, he will not take revenge, and he provides for them.
  2. Luke 15:11–24, confirm. The son who wasted everything comes home. The father runs to him, embraces him, and welcomes him back.
  3. Matthew 18:21–35, confirm. A servant is forgiven a debt he could never repay, then refuses to forgive a much smaller debt. Jesus says this is how the Father will treat us if we do not forgive. Kid line stops before the violent punishment in verse 34. Do not describe torture.
- Scenarios:
  1. A friend said something mean and later says “sorry” badly. Questions: What would forgiving them look like today? Does forgiving mean saying the words did not hurt?
  2. You are the one who needs to say sorry. Questions: What sentence tells the truth? What can you do, not only say?
- Commitment: “I will forgive: when someone is sorry, I will not keep the hurt as a weapon.”
- Encouragement: “We forgive because the Lord has forgiven us.”
- Worksheet: exact, slug `forgiveness`, key `VIR_FORGIVENESS`, card VIR-069.

### 5.12 Patience

- Basis: CCC 1832 and Galatians 5:22, read.
- Key verse, Colossians 3:12, read. Patience is the last word in a list, and the sentence is complete: “Put on then, as God’s chosen ones, holy and beloved, heartfelt compassion, kindness, humility, gentleness, and patience,”. Note that this one verse also names kindness, humility, and gentleness. The patience slide highlights patience and does not pretend the verse is only about that.
- Stories:
  1. Hebrews 11:11, read, from the waiting side. The child comes because they trusted a promise that took a long time. (Faith’s slide uses the same verse for belief. This slide is about not quitting the wait. Say that in the caption so the two slides are not copies.)
  2. Luke 2:25–38, confirm. Simeon and Anna have waited a long time in the temple. They recognize the child and give thanks.
  3. Genesis 8:6–12, confirm. Noah sends out a dove and waits. The first time it returns. Later it brings an olive leaf. Then it does not return, and he knows the water has gone down.
- Scenarios:
  1. A little sibling is learning something you already know, slowly. Questions: What does patience look like in your voice? What would rushing them teach them?
  2. You are last in a line that is not moving. Questions: What can you do with the wait that does not shove anyone? Who is having a harder time in the line than you are?
- Commitment: “I will be patient: I will bear with people, and I will not quit a good wait.”
- Encouragement: “God is patient with us. We can practice it in small lines and slow afternoons.”
- Worksheet: none. `perseverance` is a different virtue and a different sheet.

### 5.13 Gratitude

- Basis: CCC 2637–2638. Thanksgiving is a form of prayer, grateful for what God has done.
- Key verse, 1 Thessalonians 5:18, read: “In all circumstances give thanks, for this is the will of God for you in Christ Jesus.”
- Stories:
  1. Luke 17:11–19, confirm. Ten lepers are healed. One comes back praising God and thanking Jesus. Jesus asks where the other nine are.
  2. 1 Samuel 1:24–28 and 2:1, confirm. After Samuel is born, Hannah brings him to the house of the Lord and prays a thanksgiving.
  3. Acts 3:1–9, confirm. A man who could not walk is healed at the temple gate. He walks and praises God.
- Scenarios:
  1. Dinner is not what you hoped. Questions: What is still a real gift on the table? How could you thank the person who made it?
  2. A friend shares their markers with you. Questions: What sentence thanks them specifically? What is the difference between “thanks” and noticing what they gave up?
- Commitment: “I will be grateful: in all circumstances I will name one gift and thank God for it.”
- Encouragement: “One man out of ten went back. You can be the one who returns.”
- Worksheet: exact, slug `gratitude`, key `VIR_GRATITUDE`, card VIR-074.

### 5.14 Obedience

- Basis: CCC 2214–2217 (honor and obey parents, in the Lord) and CCC 144 (faith includes obedience to God). Obedience is not “do whatever any adult says.” A command to do wrong, or a touch or secret that feels unsafe, is not owed obedience. The child tells another trusted adult. Put that in the questions, not in a scare slide.
- Key verse, Ephesians 6:1, read. NABRE brackets a phrase: “Children, obey your parents [in the Lord], for this is right.” Keep the brackets in the editor note. The child-facing line can read “Children, obey your parents in the Lord, for this is right.” and the note explains the brackets.
- Stories:
  1. Luke 1:26–38, confirm. Mary hears God’s ask and answers that it be done to her according to his word.
  2. Hebrews 11:7 with Genesis 6:22, confirm the Genesis verse. Noah does all that God commands him about the ark.
  3. Luke 2:51, confirm. After the teachers in the temple, Jesus goes back to Nazareth with Mary and Joseph and is obedient to them.
- Scenarios:
  1. A parent says to pause a game for a chore. Questions: What does obeying in the next minute look like? What story are you telling yourself if you say “one more level” five times?
  2. An adult asks you to lie, to hide a touch, or to keep a secret that makes you feel wrong. Questions: Is that the kind of obedience Ephesians means by “in the Lord”? Which safe adult can you tell today?
- Commitment: “I will obey: I will do what my parents and teachers rightly ask, and I will not obey a command to do wrong.”
- Encouragement: “Jesus was obedient in Nazareth. Obedience to God comes first.”
- Worksheet: none.

### 5.15 Generosity

- Basis: CCC 1832 and Galatians 5:22, read (NABRE’s word is “generosity”).
- Key verse, 2 Corinthians 9:7, read: “Each must do as already determined, without sadness or compulsion, for God loves a cheerful giver.”
- Stories:
  1. Mark 12:41–44, confirm. Rich people give large sums. A poor widow puts in two small coins, everything she has. Jesus says she has given more than the rest.
  2. John 6:8–13, confirm. A boy has five barley loaves and two fish. Jesus gives thanks, and the crowd is fed, with baskets left over.
  3. Tobit 4:7–11, confirm on bible.usccb.org/bible/tobit/4 before quoting. Tobit tells his son Tobias to give alms in proportion to what he has and not to turn his face from the poor. This is a deuterocanonical book and belongs in a Catholic list.
- Scenarios:
  1. You have allowance and a parish collection is happening. Questions: What could you decide ahead of time to give? How can you give it cheerfully, not so people see?
  2. You have two good pencils and a classmate has none. Questions: What is a cheerful way to share one? What would giving “with sadness” look like?
- Commitment: “I will be generous: I will decide to give, and I will give it gladly.”
- Encouragement: “God loves a cheerful giver. The widow’s two coins were everything, given freely.”
- Worksheet: none. Kindness is not this sheet.

### 5.16 Self-control

- Basis: CCC 1832 and Galatians 5:23, read.
- Key verse, Sirach 18:30, read (deuterocanonical): “Do not let your passions be your guide, but keep your desires in check.” The existing challenge card VIR-072 paraphrases Proverbs 16:32. The NABRE of that proverb, also read, is “The patient are better than warriors, and those who rule their temper, better than the conqueror of a city.” Do not copy the card’s paraphrase onto this slide. Sirach 18:30 is the key verse because it is one clean sentence about desire. Proverbs 16:32 may be mentioned as a second witness.
- Stories:
  1. 1 Samuel 24:3–8, confirm. Saul is in David’s power in a cave. David will not strike the Lord’s anointed. He stops himself and stops his men.
  2. Matthew 4:1–4, confirm. Jesus is hungry in the desert and will not turn stones into bread at the tempter’s word.
  3. Luke 22:49–51, confirm. In the garden a disciple strikes the high priest’s servant. Jesus says no more of that and heals the ear. The self-control is the stopped blow; the gentleness slide does not reuse this moment.
- Scenarios:
  1. You are furious and a mean sentence is in your mouth. Questions: What do you do with your body for ten seconds? What sentence is still true after you are calm?
  2. You want a third treat and your stomach is already full. Questions: What is the desire asking for? What would “keep your desires in check” look like here?
- Commitment: “I will use self-control: I will not let a feeling be the boss of my hands or my mouth.”
- Encouragement: “David stopped his own hand. You can stop yours.”
- Worksheet: exact, slug `self-control`, key `VIR_SELF_CONTROL`, card VIR-072.

### 5.17 Purity of heart

- Basis: CCC 2518 and 2521–2522 (purity of heart and modesty). Matthew 5:8. This is the age-right face of what CCC 1832 calls chastity. It is not a sex-education card.
- Key verse, Matthew 5:8, read: “Blessed are the clean of heart, for they will see God.” NABRE says “clean of heart,” not “pure in heart.” CCC 2518 quotes the older English “pure in heart.” The slide uses the NABRE and may say that “clean of heart” is the same beatitude.
- Stories:
  1. Luke 18:15–17, read. People bring even infants. The disciples rebuke them. Jesus calls the children and says the kingdom belongs to such as these, and that whoever does not accept the kingdom like a child will not enter it.
  2. 1 Samuel 16:6–13, confirm. Samuel looks at the tall older brothers. The Lord tells him not to judge by appearance, because the Lord looks at the heart. David is anointed.
  3. John 1:47, confirm the wording. Jesus sees Nathanael and calls him a true Israelite in whom there is no duplicity. Kid line: Jesus rejoices over a heart with nothing tricky in it.
- Scenarios:
  1. A show or a picture on a screen makes you feel you should not be looking. Questions: What is the clean-hearted thing to do with your eyes right now? Which adult can you tell if it pops up again?
  2. Kids are repeating a bathroom joke at lunch and it is getting mean. Questions: Do you have to laugh to belong? What could you say, or where could you move, that keeps your words clean?
  3. You want an outfit that makes people stare. Questions: What clothes let you play and still show respect for your body? Who helps you decide?
- Commitment: “I will keep a clean heart: I will guard my eyes and my words, and I will dress with respect.”
- Encouragement: “A clean heart is promised that it will see God. That is a happy promise.”
- Worksheet: none. Do not attach any sheet that is about adult chastity. There isn’t one in this repo, and this slide must not go looking for one.

### 5.18 Perseverance

- Basis: CCC 162 (perseverance in faith), CCC 1821 (hope keeps us from discouragement), and the endurance inside fortitude, CCC 1808. It is not a second Courage card. Courage faces fear. Perseverance stays at a good work over time.
- Key verse, Galatians 6:9, read: “Let us not grow tired of doing good, for in due time we shall reap our harvest, if we do not give up.”
- Stories:
  1. Luke 18:1–8, read. Jesus tells the parable so they will pray always without becoming weary. The widow does not stop asking.
  2. Nehemiah 4 and 6:15–16, confirm. People mock and threaten the builders. They keep working, and the wall is finished.
  3. Matthew 15:21–28, confirm. A Canaanite mother keeps asking Jesus to heal her daughter after the disciples want her sent away. Jesus praises her faith and heals the girl. Kid line must not teach that ignoring people is holy. The point is her perseverance and his answer.
- Scenarios:
  1. Piano, times tables, or a hard book feels boring on day four. Questions: What did you already finish that you could not do on day one? What is the next small piece, not the whole mountain?
  2. You are praying for someone and nothing seems to change. Questions: What did Jesus say to do instead of becoming weary? What is one way to pray again today without a show?
- Commitment: “I will persevere: I will not grow tired of doing good, and I will not give up.”
- Encouragement: “The harvest comes in due time. Today you only have to continue.”
- Worksheet: exact, slug `perseverance`, key `VIR_PERSEVERANCE`, card VIR-060.

### 5.19 Respect

- Basis: CCC 1929–1933, respect for the human person, and 1 Peter 2:17.
- Key verse, 1 Peter 2:17, read: “Give honor to all, love the community, fear God, honor the king.”
- Stories:
  1. Genesis 18:1–8, confirm. Abraham sees three visitors, bows, brings water for their feet, and hurries to set a meal before them.
  2. Matthew 8:5–10, confirm. The centurion says he is not worthy to have Jesus enter his house, and he trusts Jesus’ word. Jesus marvels at his faith. This slide is about the honor he shows, not a second faith lesson.
  3. Ruth 2:8–16, confirm, from Ruth’s side as well as Boaz’s. She gleans where she is welcomed, and he treats a foreign widow with honor. (Kindness already uses Boaz’s care. This caption is about honor given to a person who could have been ignored.)
- Scenarios:
  1. You talk over a teacher or a grandparent. Questions: What does “give honor to all” change about your voice? How do you enter a conversation that has already started?
  2. Kids copy someone’s accent or the way they walk. Questions: Is that honor? What sentence would you want if it were your walk or your voice?
- Commitment: “I will show respect: I will give honor to every person, starting with the one in front of me.”
- Encouragement: “Every person is someone God loves. Honor is how that looks in a hallway.”
- Worksheet: none. `citizenship` and `social-intelligence` are not respect.

### 5.20 Responsibility

- Basis: CCC 1731–1738. Freedom comes with responsibility for our acts.
- Key verse, Luke 16:10, read: “The person who is trustworthy in very small matters is also trustworthy in great ones; and the person who is dishonest in very small matters is also dishonest in great ones.” The USCCB note on Luke 16:10–12 calls this fidelity in responsibility, and it points at Matthew 25.
- Stories:
  1. Matthew 25:14–27, read. A man entrusts his servants with his money, each according to ability. Two put it to work. One buries it. The master praises the trustworthy servants and calls the other wicked and lazy. Do not dwell on the outer darkness in verse 30 in the kid line.
  2. Genesis 41:46–49 and 41:53–57, confirm. Joseph stores grain in the plentiful years and opens the stores when the famine comes, so people can eat.
  3. Acts 6:1–6, confirm. Widows are being overlooked in the daily distribution. The community chooses seven people to see that the food is handled faithfully.
- Scenarios:
  1. It is your week to feed the pet or take out the trash, and nobody is watching. Questions: What is the small matter you were trusted with? What happens to the pet, or the kitchen, if you wait for a reminder?
  2. You borrowed a library book. Questions: What does trustworthy look like on the due day? Who is affected if you leave it in a backpack?
- Commitment: “I will be responsible: I will do the small job I was trusted with, even when no one is watching.”
- Encouragement: “Small faithfulness is how people learn they can trust you with more.”
- Worksheet: none. `leadership` is not this virtue.

### 5.21 Gentleness

- Basis: CCC 1832 and Galatians 5:23, read.
- Key verse, Matthew 11:29, read: “Take my yoke upon you and learn from me, for I am meek and humble of heart; and you will find rest for yourselves.” NABRE says “meek,” not “gentle.” The slide can say that meek here means a strong person who is gentle. Do not swap in a softer translation.
- Stories:
  1. Matthew 11:28–30, read. Jesus invites the weary to come to him. His yoke is easy and his burden light.
  2. 1 Kings 19:11–13, confirm the exact phrase before quoting. Wind, earthquake, and fire pass by, and the Lord is not in them. Elijah then hears a quiet sound. Do not use the King James phrase “still small voice” unless the NABRE page actually has it. It does not, in the usual NABRE wording; confirm and use the NABRE’s own words.
  3. Matthew 12:18–21, confirm. Matthew quotes the servant who will not break a bruised reed. Kid line: Jesus does not snap what is already bent. He is gentle with people who are hurting.
- Scenarios:
  1. A sibling is crying over something that seems small to you. Questions: What would a gentle voice say first? What does the bruised reed teach you not to do?
  2. You are right in an argument and you want to win loudly. Questions: Can you stay right and still be meek? What sentence is both true and gentle?
- Commitment: “I will be gentle: I will not break what is already bruised, in people or in words.”
- Encouragement: “Jesus is meek and humble of heart. You can learn that from him.”
- Worksheet: none.

### 5.22 Joy

- Basis: CCC 1832 and Galatians 5:22, read.
- Key verse, Philippians 4:4, read. The words on the USCCB page are “Rejoice in the Lord always. I shall say it again: rejoice” and the next verse begins “Your kindness should be known to all.” The chapter HTML runs the two verses together, so do not invent a punctuation mark that the page did not show. The words to display are those.
- Stories:
  1. Luke 15:4–7, confirm. A shepherd finds the lost sheep, lays it on his shoulders, and calls friends to rejoice with him. Jesus says there is joy in heaven over one sinner who repents.
  2. Luke 1:39–45, confirm. Mary visits Elizabeth. The baby leaps, and Elizabeth cries out with joy at Mary’s greeting.
  3. Matthew 28:1–10, confirm. The women leave the tomb afraid and overjoyed. Jesus meets them. Kid line: the joy is that he is alive, not that the morning was easy.
- Scenarios:
  1. A rainy Saturday ruins a park plan. Questions: What is still worth rejoicing in, in the Lord, on a rained-out day? What small good can you enjoy without pretending you are not disappointed?
  2. A friend gets good news that you wanted for yourself. Questions: What would rejoicing with them look like? What is the sulky version, and what does it cost the friendship?
- Commitment: “I will rejoice in the Lord, on ordinary days and not only on party days.”
- Encouragement: “Joy is a fruit of the Spirit. You can ask for it and then share it.”
- Worksheet: none. `zest` and `humor` are different challenge sheets. Do not attach them.

### 5.23 Peace

- Basis: CCC 2304 (peace is the work of justice and the effect of charity) and Galatians 5:22, read.
- Key verse, John 14:27, read: “Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you. Do not let your hearts be troubled or afraid.”
- Stories:
  1. Mark 4:35–41, confirm the exact rebuke before quoting it. A storm fills the boat. The disciples wake Jesus. He tells the wind and the sea to be quiet, and there is a great calm. He asks why they are afraid.
  2. John 20:19–21, confirm. The doors are locked. Jesus stands among the disciples and says, “Peace be with you,” more than once, and he shows them his hands and side.
  3. 1 Samuel 25:18–35, confirm. Abigail meets David with food and wise words and turns him back from attacking Nabal’s house. Kid line: she makes peace before the harm is done.
- Scenarios:
  1. Two friends are shouting and both want you to pick a side and add a louder insult. Questions: What would a peacemaker do in the next minute? What would pouring on more words do?
  2. You are worried at bedtime and your heart is racing. Questions: Which words of Jesus can you say slowly? What is one worry you can put in a parent’s hands tonight?
- Commitment: “I will be a peacemaker: I will not add fuel, and I will take the peace Jesus gives.”
- Encouragement: “His peace is not the world’s kind. It can sit with you in a storm.”
- Worksheet: none. The Prayer of Saint Francis sheets are prayer worksheets, not this virtue’s sheet, and they should not be forced onto the slide.

### 5.24 Faithfulness

- Basis: CCC 1832 and Galatians 5:22, read. Faithfulness here is loyalty and staying true. It is not a second copy of the theological virtue of faith.
- Key verse, Matthew 25:21, read: “Well done, my good and faithful servant. Since you were faithful in small matters, I will give you great responsibilities. Come, share your master’s joy.”
- Stories:
  1. Ruth 1:16–17, read. Ruth will not leave Naomi. She says, “Do not press me to go back and abandon you! Wherever you go I will go, wherever you lodge I will lodge. Your people shall be my people and your God, my God.” She adds that even death will not separate them.
  2. Daniel 6:7–23, confirm before quoting. Daniel prays three times a day as before, after the law forbids it. He is thrown to the lions and is found alive in the morning. (Courage may mention the den. This slide’s point is the daily prayer he did not drop.)
  3. John 19:25–27, confirm. Mary and the beloved disciple stand near the cross. Jesus gives his mother into the disciple’s care, and the disciple takes her from that hour. Kid line: they stayed.
- Scenarios:
  1. A team or a chore is no longer fun, and you want to disappear. Questions: What did you say you would do? What does faithful in a small matter look like this week?
  2. Friends change the plan and leave one person out, and it would be easier to go along. Questions: Who did you say you would stick with? What is one way to stay loyal without being cruel to the group?
- Commitment: “I will be faithful: I will keep the small promise I made, to God and to people.”
- Encouragement: “Ruth stayed. A faithful servant shares the master’s joy.”
- Worksheet: none.

## 6. Worksheet map

Virtue Challenge sheets are real. They are HTML gospel sheets (`src/components/gospel-sheet/GospelSheet.tsx`), not uploaded preview images. `src/lib/resource/card-related.ts` says so: activities have a public preview image, and these worksheets do not.

What exists for each matching sheet:

| Piece | Where |
| --- | --- |
| Public guide, free to read | `/catholic-virtue-challenge/<slug>` (`publicPath` in `src/lib/evergreen-catalog.ts`) |
| Print, sign-in then Plus | `/print/evergreen/<slug>` (`src/app/print/evergreen/[slug]/page.tsx`). `canOpenResourceSheet` only unlocks a non-Plus reader for this Sunday’s key. `VIR_*` keys are never that Sunday key, so the print view is Plus. |
| Browse thumb | `SheetThumb` when the viewer may open the sheet, `LockedSheetPreview` otherwise (`src/components/resource/ResourceCardGrid.tsx`). There is no `preview-color.webp`. |
| Nearest image file | The challenge card thumb, for example `/cards/thumbs/VIR-059.webp`. That file is the vector icon card, not a picture of the worksheet. The carousel must not label it “worksheet preview.” |
| Art filenames inside the JSON | `art.main` such as `VIR_COURAGE_main.png` is a placeholder name. `GospelSheet` renders it as a labelled empty box (`gs-ph`). The PNG is not in the repo. |

| Virtue | Fit | Slug | Sheet key | Card thumb |
| --- | --- | --- | --- | --- |
| Faith | none | | | |
| Hope | exact | `hope` | `VIR_HOPE` | `/cards/thumbs/VIR-075.webp` |
| Charity | closest (`love`) | `love` | `VIR_LOVE` | `/cards/thumbs/VIR-063.webp` |
| Prudence | exact | `prudence` | `VIR_PRUDENCE` | `/cards/thumbs/VIR-071.webp` |
| Justice | closest (`fairness`) | `fairness` | `VIR_FAIRNESS` | `/cards/thumbs/VIR-067.webp` |
| Courage | exact | `courage` | `VIR_COURAGE` | `/cards/thumbs/VIR-059.webp` |
| Temperance | none | | | |
| Humility | exact | `humility` | `VIR_HUMILITY` | `/cards/thumbs/VIR-070.webp` |
| Kindness | exact | `kindness` | `VIR_KINDNESS` | `/cards/thumbs/VIR-064.webp` |
| Honesty | exact | `honesty` | `VIR_HONESTY` | `/cards/thumbs/VIR-061.webp` |
| Forgiveness | exact | `forgiveness` | `VIR_FORGIVENESS` | `/cards/thumbs/VIR-069.webp` |
| Patience | none | | | |
| Gratitude | exact | `gratitude` | `VIR_GRATITUDE` | `/cards/thumbs/VIR-074.webp` |
| Obedience | none | | | |
| Generosity | none | | | |
| Self-control | exact | `self-control` | `VIR_SELF_CONTROL` | `/cards/thumbs/VIR-072.webp` |
| Purity of heart | none | | | |
| Perseverance | exact | `perseverance` | `VIR_PERSEVERANCE` | `/cards/thumbs/VIR-060.webp` |
| Respect | none | | | |
| Responsibility | none | | | |
| Gentleness | none | | | |
| Joy | none | | | |
| Peace | none | | | |
| Faithfulness | none | | | |

Twelve virtues have no suitable sheet: Faith, Temperance, Patience, Obedience, Generosity, Purity of heart, Respect, Responsibility, Gentleness, Joy, Peace, Faithfulness. The worksheet slide for those should say that a matching sheet is not in the library yet, and should not borrow a neighbor. Charity and Justice may show the closest sheet with one honest line (“This is our Love sheet” / “This is our Fairness sheet”).

Plus is the point of the slide that has a sheet: the guide page is readable, the print route redirects to `/subscribe` when `sheetOpenAllowed` is false, and the carousel shows `LockedSheetPreview` until the family has Plus. That matches the line already on the challenge page: Plus unlocks worksheet previews and printing.

## 7. Technical plan

### 7.1 Data

One JSON file per virtue under `src/data/virtues/`, plus `src/data/virtues/index.ts` that imports them in the order of section 3. Suggested fields:

- `slug`, `name`, `internalName` (`덕목` lives once on the section, not on every card)
- `basis` (CCC paragraphs and the scripture note)
- `stories[]`: `ref`, `summary`, `citationStatus` (`read` or `confirm`), `cardId` once the picture exists
- `keyVerse`: `ref`, `text`, `note` (conjunction, brackets, or “continues the previous verse”)
- `scenarios[]`: `situation`, `questions` (one or two)
- `commitment`, `encouragement`
- `worksheet`: `{ fit: "exact" \| "closest" \| "none", slug?, key?, note? }`

No database table. The challenge sheets and the picture cards stay the sources for worksheets and art. A test imports the JSON and checks: 24 slugs, unique names, every `exact` and `closest` slug is in `EVERGREEN_PAGES`, every `none` has no slug, courage’s verse is Matthew 10:31 and its four questions match section 5.6, no `text` field contains a four-digit year, and every `keyVerse.text` equals a pinned string.

### 7.2 Routes and sidebar

- Hub: `src/app/(site)/virtues/page.tsx` at `/virtues`. A list of the 24, grouped theological / cardinal / everyday, inside `SidebarPagePanel` like `/prayers`.
- One virtue: `src/app/(site)/virtues/[slug]/page.tsx`. This is a real URL, not only a query overlay, so a parent can share it and it can sit in the sitemap. The page opens the carousel immediately. Closing returns to `/virtues`.
- Carousel component: new `src/components/virtues/VirtueCarousel.tsx`, copying the behavior of `PrayerCarousel` (portal, inert background, scroll lock, focus on close, swipe, reduced motion) and not its study modes. Slides: one per story, then the verse, then one per scenario, then commitment, then worksheet. Courage is about 3 + 1 + 2 + 1 + 1 = 8 slides.
- Mobile: the same overlay is full viewport. Type size and the illustration use the prayer carousel’s stacked layout. Do not require hover. The worksheet control is a full-width button.
- Sidebar: extend `SidebarIcon` and `SIDEBAR_ITEMS` in `src/lib/sidebar-navigation.ts`. Recommended place: after Prayer and before Saints. Add `public/images/sidebar/virtues.png` in the same hand-drawn pastel style as the other files in that folder, and a branch in `src/components/home/SidebarIllustration.tsx`. `sidebarItemIsCurrent` for Virtues is `/virtues` only. Leave `/catholic-virtue-challenge` on the Prayer item so the old hub does not move. Update `scripts/test-sidebar-navigation.ts`.
- Sitemap: add `/virtues` and each `/virtues/<slug>` beside the other hub entries in `src/lib/sitemap-entries.ts`.

### 7.3 SEO

Follow `pageMetadata` as `/prayers` does, plus a breadcrumb. Titles must not collide with the challenge pages. Those pages already say “Catholic Virtue Challenge” and “This Week’s Catholic Virtue.” New titles should be distinct, for example “Courage for Catholic kids” on `/virtues/courage`, with a description that mentions the Bible stories and not the fridge checklist. Canonical path is `/virtues/<slug>`. The print URL of the worksheet stays `noindex`, as it is today.

### 7.4 Free and Plus

Match the site rather than inventing a new gate.

| Surface | Who can see it |
| --- | --- |
| Hub and carousel reading (stories, verse, scenarios, commitment) | Everyone, including signed-out visitors. Same idea as prayer Read mode and the public challenge guide. |
| Worksheet slide when `fit` is none | Everyone. It says there is no sheet yet. No lock icon on an empty promise. |
| Worksheet slide when a sheet exists | Everyone sees the title and the link to the public guide. The sheet picture is `LockedSheetPreview` until Plus, then `SheetThumb`. Print goes to the existing Plus route. |
| New picture cards on `/resource?view=cards` | Thumbs are public. The sharp thumb is replaced by the locked greyscale for a Plus-locked tile, which is the current card rule. Full PNG download stays Plus. |
| Family Virtue Challenge pages | Unchanged. |

Do not put the Bible stories behind Plus. The Plus invitation is the worksheet at the end.

### 7.5 Tests

- `scripts/test-virtues.ts`: schema, pinned NABRE strings, courage block, worksheet slugs, no year, no quote characters inside key verses that did not have them on USCCB.
- Compositor geometry test once images exist, using the thresholds in section 4.4.
- Sidebar test updated for the new item and for “`/catholic-virtue-challenge` is still Prayer.”
- Existing `pnpm test:evergreen-sheets` must still see 24 challenge sheets. This feature adds a hub; it does not add a 25th `VIR_` sheet.

### 7.6 Phases

1. This document. No product code.
2. Pilot, Courage only. Data file, `/virtues` and `/virtues/courage`, carousel, three story illustrations through the compositor, cards from VIR-078, worksheet slide pointed at `courage`. Fix the evergreen manifest writer so it cannot wipe the new hashes. Sidebar item appears in this phase so it does not link to an empty page. The other 23 virtues are visible on the hub as not open yet, without fake stories.
3. Theological and cardinal batch: Faith, Hope, Charity, Prudence, Justice, Temperance, plus the courage pilot already live.
4. The remaining everyday virtues, in two reviewable batches so Scripture confirmation and art review stay small.
5. After each batch: `pnpm` tests named above, `pnpm lint`, and a browser pass of the hub, one carousel on a phone-width viewport and a desktop viewport, the worksheet lock for a signed-out visitor, and the new cards at `/resource?view=cards`.

## 8. Open questions for Jisun

1. Sidebar order. This plan puts Virtues between Prayer and Saints. Should it sit somewhere else in the list?
2. Should the button show only “Virtues,” or also 덕목?
3. Courage’s pictures. Prefer new Virtue-set cards (VIR-078 and following), and leave BIB-053/054/055 for a separate art repair? Or block the pilot until those three PNGs are regenerated to section 4.2 and then reuse them?
4. Goodness is the fruit left out so the count stays 24. Should it replace Responsibility or Respect?
5. Purity of heart is included, modestly, and chastity is not its own card. Keep that?
6. Story slides become picture cards. Scenario pictures stay off the card catalog unless you want them too.
7. Charity → Love sheet, and Justice → Fairness sheet, are marked closest rather than exact. Show those, or show “no sheet yet” for them as well?
8. For the twelve virtues with no sheet, is a plain “not in the library yet” slide right, or should that slide be omitted?
9. The challenge sheets quote a Douay-style line (`keyVerseDR`). The new bundles quote NABRE. Both would be on the site. Is that acceptable?
10. Confirm the hub path `/virtues` and that `/catholic-virtue-challenge` stays the fridge-checklist product under Prayer.

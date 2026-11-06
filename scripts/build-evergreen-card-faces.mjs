/** Reproducible cream/warm designed faces for the 28 evergreen cards.
 * Originals stay outside public and are served only through the existing entitlement-checked API.
 * Run: node scripts/build-evergreen-card-faces.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const cards = JSON.parse(await fs.readFile("src/data/cards/cards.json", "utf8"))
  .filter((c) => c.set === "Order of the Mass" || c.set === "Family Virtue Challenge");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function lines(text, max) {
  const result = []; let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > max) { result.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) result.push(line);
  return result;
}
function textBlock(text, max, y, size, fill, weight = 400, gap = size * 1.3) {
  return lines(text, max).map((line, i) => `<text x="540" y="${y + i * gap}" text-anchor="middle" font-family="Trebuchet MS,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`).join("");
}
const heart = '<path d="M0 85C-165-15-150-135-65-135C-25-135 0-105 0-85C0-105 25-135 65-135C150-135 165-15 0 85Z" fill="#dc8978"/>';
const book = '<path d="M-180-105Q-90-145 0-90Q90-145 180-105V125Q90 90 0 140Q-90 90-180 125Z" fill="#fffdf6"/><path d="M0-90V140M-145-55Q-80-75-35-45M35-45Q80-75 145-55M-145 0Q-80-20-35 10M35 10Q80-20 145 0M-145 55Q-80 35-35 65M35 65Q80 35 145 55" fill="none"/>';
const sun = '<circle r="88" fill="#efc06a"/><path d="M0-125V-170M0 125V170M125 0H170M-125 0H-170M90-90L125-125M-90-90L-125-125M90 90L125 125M-90 90L-125 125" fill="none"/><path d="M-35 28Q0 65 35 28" fill="none"/><circle cx="-30" cy="-14" r="6"/><circle cx="30" cy="-14" r="6"/>';
const plant = '<path d="M0 140V-110M0 15Q-165 30-130-95Q-10-100 0 15M0-45Q160-15 130-145Q10-145 0-45" fill="#a6bd95"/><path d="M-90 140H90L65 210H-65Z" fill="#dba58a"/>';
const shield = '<path d="M0-170L150-115V-10Q150 120 0 200Q-150 120-150-10V-115Z" fill="#a9c7c1"/><path d="M-65 0L-15 55L85-70" fill="none" stroke="#fffdf6" stroke-width="28"/>';
const compass = '<circle r="155" fill="#fffdf6"/><circle r="128" fill="#f4dfb5"/><path d="M60-100L30 35L-60 100L-30-35Z" fill="#c97d69"/><path d="M60-100L-30-35L30 35Z" fill="#8eb4ad"/><circle r="13" fill="#fffdf6"/>';
const church = '<path d="M-170-20L0-175L170-20V165H-170Z" fill="#edcb96"/><path d="M-205-10L0-205L205-10" fill="none" stroke-width="22"/><path d="M0-205V-270M-30-245H30"/><path d="M-45 165V70A45 45 0 0 1 45 70V165" fill="#aa8a6b"/><path d="M-120 15H-75V75H-120ZM75 15H120V75H75Z" fill="#a9c7c1"/>';
const chalice = '<ellipse cy="-135" rx="110" ry="22" fill="#fffdf6"/><path d="M-110-135Q-110 45 0 45Q110 45 110-135ZM0 45V155M-90 175Q0 130 90 175Z" fill="#e2b55f"/><circle cy="-210" r="63" fill="#fffdf6"/><path d="M0-245V-175M-28-210H28" fill="none"/>';
function symbol(card, i) {
  if (card.id === "MAS-066") return church;
  if (card.id === "MAS-067") return book;
  if (card.id === "MAS-068") return chalice;
  if (card.id === "MAS-069") return `<g transform="translate(-115,-105) scale(.36)">${church}</g><g transform="translate(115,-105) scale(.48)">${book}</g><g transform="translate(-115,115) scale(.4)">${chalice}</g><g transform="translate(115,115) scale(.5)">${heart}</g>`;
  if (/Love|Kindness|Forgiveness|Social|Humility/.test(card.title)) return heart;
  if (/Learning|Curiosity|Perspective|Prudence/.test(card.title)) return book;
  if (/Courage|Honesty|Control|Fairness|Citizenship/.test(card.title)) return shield;
  if (/Perseverance|Creativity|Beauty|Gratitude/.test(card.title)) return plant;
  return i % 2 ? sun : compass;
}
for (const dir of ["assets/card-originals", "public/cards/thumbs", "public/cards/locked"]) await fs.mkdir(dir, { recursive: true });
const manifest = {};
for (const [i, card] of cards.entries()) {
  const mass = card.set === "Order of the Mass";
  const accent = mass ? "#b85c27" : "#597e69";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <rect width="1080" height="1350" fill="#fcf8f1"/>
    <rect x="35" y="35" width="1010" height="1280" rx="38" fill="none" stroke="#e3d5be" stroke-width="3"/>
    <rect x="265" y="65" width="550" height="54" rx="27" fill="${accent}"/>
    ${textBlock(mass ? "ORDER OF THE MASS" : "FAMILY VIRTUE CHALLENGE", 35, 101, 26, "#ffffff", 700)}
    ${textBlock(card.title, 25, 191, 60, "#40392f", 700, 69)}
    <rect x="95" y="335" width="890" height="595" rx="40" fill="${mass ? "#f6ead0" : "#eef0df"}" stroke="#ded5bf" stroke-width="3"/>
    <circle cx="540" cy="625" r="235" fill="#fffaf0"/>
    <g transform="translate(540 625)" stroke="#826c52" stroke-width="9" stroke-linejoin="round" stroke-linecap="round">${symbol(card, i)}</g>
    <g fill="#dfb566"><path d="M200 410L207 430L227 437L207 444L200 464L193 444L173 437L193 430Z"/><path d="M866 796L873 816L893 823L873 830L866 850L859 830L839 823L859 816Z"/></g>
    <path d="M220 860Q260 815 285 850M795 410Q820 380 855 405" fill="none" stroke="#a5b99b" stroke-width="10" stroke-linecap="round"/>
    ${textBlock(card.text, 43, 1010, 37, "#40392f", 400, 48)}
    ${card.ref ? textBlock(card.ref, 40, 1232, 28, accent, 700) : ""}
    <text x="75" y="1291" font-family="Arial,sans-serif" font-size="20" fill="#958c7b">${card.id}</text>
    <text x="1005" y="1291" text-anchor="end" font-family="Arial,sans-serif" font-size="20" fill="#958c7b">catholickidscrafts.com</text>
  </svg>`;
  const original = path.join("assets/card-originals", `${card.id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(original);
  await sharp(original).resize(432, 540).webp({ quality: 80, effort: 6 }).toFile(`public/cards/thumbs/${card.id}.webp`);
  await sharp(original).resize(216, 270).greyscale().blur(3).webp({ quality: 40 }).toFile(`public/cards/locked/${card.id}.webp`);
  manifest[card.id] = { sha256: createHash("sha256").update(await fs.readFile(original)).digest("hex") };
}
await fs.writeFile("src/data/cards/designed-originals.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`Built ${cards.length} private originals, sharp thumbs, and locked previews.`);

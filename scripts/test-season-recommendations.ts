/**
 * Printables Worksheets season craft/activity recommendations.
 */
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SeasonRecommendations } from "../src/components/resource/SeasonRecommendations";
import {
  SEASON_REC_PAGE_SIZE,
  seasonActivityRecommendations,
} from "../src/lib/resource/activities";
import { RESOURCE_SEASONS } from "../src/lib/resource/sheets";

Object.assign(globalThis, { React });

const advent = seasonActivityRecommendations("advent");
assert.ok(advent.length > SEASON_REC_PAGE_SIZE, `Advent should paginate (got ${advent.length})`);
assert.ok(advent.every((a) => a.seasons.includes("advent")));

const christmas = seasonActivityRecommendations("christmas");
assert.ok(christmas.length > 0);
assert.ok(christmas.every((a) => a.seasons.includes("christmas")));

for (const s of RESOURCE_SEASONS) {
  const list = seasonActivityRecommendations(s.id);
  assert.ok(Array.isArray(list));
  for (const a of list) assert.ok(a.seasons.includes(s.id), `${a.slug} missing ${s.id}`);
}

const pages = Math.ceil(advent.length / SEASON_REC_PAGE_SIZE);
const href = "/resource?sunday=2026-11-29#season-recs";
const html = renderToStaticMarkup(
  React.createElement(SeasonRecommendations, {
    season: "advent",
    activities: advent,
    page: 2,
    resultsHref: href,
  }),
);
assert.ok(html.includes("Advent activities"));
assert.ok(html.includes('id="season-recs"'));
assert.ok(html.includes('aria-label="Resource results pages"'));
assert.match(
  html,
  /aria-label="Resource results pages"[^>]*bg-transparent/,
  "season pagination should match cream panel (not white strip)",
);
assert.doesNotMatch(
  html,
  /aria-label="Resource results pages"[^>]*bg-white/,
  "season pagination must not use library white chrome",
);
assert.ok(html.includes("page=2") || html.includes("Page 2"));
assert.ok(html.includes('aria-current="page"'));
assert.equal(
  renderToStaticMarkup(
    React.createElement(SeasonRecommendations, {
      season: "lent",
      activities: [],
      page: 1,
      resultsHref: href,
    }),
  ),
  "",
  "empty season renders nothing",
);

console.log(
  `test-season-recommendations: Advent ${advent.length} items / ${pages} pages (size ${SEASON_REC_PAGE_SIZE}); pagination markup ok`,
);

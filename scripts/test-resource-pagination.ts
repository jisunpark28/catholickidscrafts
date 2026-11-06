/** Run: tsx scripts/test-resource-pagination.ts */
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResourcePagination, resourcePageHref, resourcePageNumbers } from "../src/components/resource/ResourcePagination";
Object.assign(globalThis, { React });
assert.deepEqual(resourcePageNumbers(1, 19), [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(resourcePageNumbers(10, 19), [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(resourcePageNumbers(11, 19), [11,12,13,14,15,16,17,18,19]);
assert.deepEqual(resourcePageNumbers(19, 19), [11,12,13,14,15,16,17,18,19]);
assert.deepEqual(resourcePageNumbers(21, 35), [21,22,23,24,25,26,27,28,29,30]);
for (let page = 1; page <= 35; page++) {
  const visible = resourcePageNumbers(page, 35);
  assert.ok(visible.includes(page));
  assert.ok(visible.length <= 10);
}
const base = "/resource?view=all&q=Jesus+%26+Mary&season=advent&level=2&page=4#results";
for (let page = 1; page <= 19; page++) {
  const target = new URL(resourcePageHref(base, page), "https://example.com");
  assert.equal(target.searchParams.get("page"), String(page));
  assert.equal(target.searchParams.getAll("page").length, 1);
  assert.equal(target.searchParams.get("q"), "Jesus & Mary");
  assert.equal(target.searchParams.get("season"), "advent");
  assert.equal(target.searchParams.get("level"), "2");
  assert.equal(target.searchParams.get("view"), "all");
  assert.equal(target.hash, "#results");
  const html = renderToStaticMarkup(React.createElement(ResourcePagination, { currentPage: page, totalPages: 19, resultsHref: base }));
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.ok(html.includes('aria-label="Page ' + page + '" aria-current="page"'));
  assert.ok(html.includes('aria-label="Resource results pages"'));
  assert.ok(!html.includes("Page 1 of"));
  assert.ok(!html.includes(">Next<"));
  assert.ok(!html.includes("Free:"));
  assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, page === 1 || page === 19 ? 1 : 0);
}
assert.equal(renderToStaticMarkup(React.createElement(ResourcePagination, { currentPage: 1, totalPages: 1, resultsHref: "/resource?view=all" })), "");
console.log("test-resource-pagination: 10-number groups, all 35 pages reachable, filter URLs, accessible current/disabled states OK");
